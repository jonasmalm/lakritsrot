from flask import Blueprint, request, jsonify
from ortools.sat.python import cp_model
import numpy



bp = Blueprint('optimize', __name__)


@bp.route('/', methods=['POST'])
def recieve_data():
    model = model = cp_model.CpModel()
    
    
    juniors = request.get_json()[0]
    boat_parameters = request.get_json()[1]
    constraints = request.get_json()[2]
    maxTime = int(request.get_json()[3])
    
    boat_parameters['minCrew'] = int(boat_parameters['minCrew']) if boat_parameters['minCrew'] else 0
    boat_parameters['noBoats'] = int(boat_parameters['noBoats'])
    boat_parameters['maxCrew'] = int(boat_parameters['maxCrew']) if boat_parameters['maxCrew'] else len(juniors)
    boat_parameters['useAllBoats'] = bool(boat_parameters['useAllBoats'])
    
    variables = {}
    variables['x'] = create_x_var(model, juniors, boat_parameters['noBoats'])
    variables['y'] = create_y_var(model, juniors, boat_parameters['noBoats'])
    variables['boat_used'] = create_boat_var(model, boat_parameters['noBoats'])
    variables['worst_boat'] = model.NewIntVar(0, 1, 'worst_boat')
    
    pref_matrix = create_pref_matrix(juniors)
    
    create_std_constraints(model, variables, boat_parameters, juniors, pref_matrix)
    create_custom_constraints(model, variables, constraints, juniors, boat_parameters)
    
    sum_exp = sum(pref_matrix[i][j] * variables['y'][i, j, b] 
                  for i in range(len(juniors)) for j in range(len(juniors)) for b in range(boat_parameters['noBoats']) if j != i)
    model.Maximize(variables['worst_boat'] + sum_exp)
    
    #Debug - skriv ut hela modellen!
    #print(solver.ExportModelAsLpFormat(False).replace('\\', '').replace(',_', ','), sep='\n')
    
    # Check if there are hints, i.e. not first iteration
    if len(request.get_json()) > 4:
        hints = request.get_json()[4]
        create_hints(variables, hints, juniors, boat_parameters['noBoats'], model)
    
    
    solver = cp_model.CpSolver()
    #Avbryt lösaren efter 60 sekunder
    solver.parameters.max_time_in_seconds = maxTime
    status = solver.Solve(model)
    print(solver.ResponseStats())
    
    if status == cp_model.INFEASIBLE:
        return dict(success=False, status='Infeasible')
    if status == cp_model.MODEL_INVALID:
        return dict(success=False, status='Model invalid')
    if status == cp_model.UNKNOWN:
        return dict(success=False, status='Unknown')
        
    
    
    
    retval = create_retval(variables, juniors, boat_parameters['noBoats'], solver)
    if status == cp_model.OPTIMAL:
        retval['status'] = 'Optimal'
    elif status == cp_model.FEASIBLE:
        retval['status'] = 'Feasible'
        retval['hints'] = get_current_variable_values(variables, juniors, boat_parameters['noBoats'], solver)
        
    retval['solver_response'] = solver.ResponseStats()
    retval['objective_value'] = solver.ObjectiveValue()
    
    return jsonify(retval)

#x[i, b] är 1 om jun i sitter i båt b, noll annars
def create_x_var(model, juniors, no_boats):
    
    x = {}
    
    for i in range(len(juniors)):
        for b in range(no_boats):
            x[i, b] = model.NewIntVar(0, 1, 'x[Junior {}, Boat {}]'.format(i, b))
    
    return x

#y[i, j, b] är 1 om jun i sitter med jun j i båt b, noll annars
def create_y_var(model, juniors, no_boats):
    
    y = {}
    
    for i in range(len(juniors)):
        for j in range(len(juniors)):
            for b in range(no_boats):
                if i != j:
                    y[i, j, b] = model.NewIntVar(0, 1, 'y[Jun i {}, Jun j {}, Boat {}]'.format(i, j, b))
    
    return y

#boat_used[b] = 1 om båt b används, 0 f.ö.
def create_boat_var(model, no_boats):
    boat_used = {}
    
    for b in range(no_boats):
        boat_used[b] = model.NewIntVar(0, 1, 'boat_used[Boat {}]'.format(b))
    
    return boat_used
 
#p[i, j] = 1 om junior i önskat att segla med junior j
def create_pref_matrix(juniors):
    p = numpy.zeros(shape=(len(juniors), len(juniors)), dtype=int)
    
    i = 0
    for junior_i in juniors:
        j = 0
        for junior_j in juniors:
            if junior_j['name'] in junior_i['wishes']:
                p[i][j] = 1
            j = j + 1
        i = i + 1
    
    return p
    
def create_std_constraints(model, variables, boat_parameters, juniors, pref_matrix):
    
    #En junior sitter i exakt en båt
    for i in range(len(juniors)):
        model.Add(sum(variables['x'][i, b] for b in range(boat_parameters['noBoats'])) == 1)
        
    #min capacity
    for b in range(boat_parameters['noBoats']):
        sum_exp = sum(variables['x'][i, b] for i in range(len(juniors)))
        
        if boat_parameters['useAllBoats']:
            model.Add(sum_exp >= max(boat_parameters['minCrew'], 1))
        else:
            model.Add(sum_exp >= boat_parameters['minCrew'] * variables['boat_used'][b])

    
    #max capacity
    if boat_parameters['noBoats']:
        for b in range(boat_parameters['noBoats']):
            sum_exp = sum(variables['x'][i, b] for i in range(len(juniors)))
            
            if boat_parameters['useAllBoats']:
                model.Add(sum_exp <= boat_parameters['maxCrew'])
            else:
                model.Add(sum_exp <= boat_parameters['maxCrew'] * variables['boat_used'][b])
        
    #Koppling x till y (jun i med jun j) -->
    for i in range(len(juniors)):
        for j in range(len(juniors)):
            for b in range(boat_parameters['noBoats']):
                if i != j:
                    model.Add(2 * variables['y'][i, j, b] <= variables['x'][i, b] + variables['x'][j, b])
    
    #Sämsta båten --> målfunktion
    for b in range(boat_parameters['noBoats']):
        sum_exp = sum(pref_matrix[i][j] * variables['y'][i, j, b] for i in range(len(juniors)) for j in range(len(juniors)) if j!= i)
        model.Add(variables['worst_boat'] <= sum_exp)
        
        #constraint_exp = [pref_matrix[i][j] * variables['y'][i, j, b] for i in range(len(juniors)) for j in range(len(juniors)) if j!= i] 
        #solver.Add(variables['worst_boat'] <= solver.Sum(constraint_exp))
        
        
#Löser BV som tvingar juniorer att segla eller inte segla tsm
def create_custom_constraints(model, variables, constraints, juniors, boat_parameters):
    for c in constraints:
        name1 = c['name1']
        name2 = c['name2']
        
        i = list(filter(lambda j: juniors[j]['name'] == name1, range(len(juniors))))[0]
        j = list(filter(lambda j: juniors[j]['name'] == name2, range(len(juniors))))[0]
        
        
        if c['mustSail']:
            #Måste segla --> summa över b av y[i,j,b] för (i,j) == 1
            sum_exp = sum(variables['y'][i, j, b] for b in range(boat_parameters['noBoats']))
            model.Add(sum_exp == 1)
            
            #constraint_exp = [variables['y'][i, j, b] for b in range(boat_parameters['noBoats'])]
            #solver.Add(solver.Sum(constraint_exp) == 1)
        else:
            #Får inte segla:
            sum_exp = sum(variables['x'][i, b] + variables['x'][j, b] for b in range(boat_parameters['noBoats']))
            model.Add(sum_exp == 1)
            
            #constraint_exp = [variables['x'][i, b] + variables['x'][j, b] for b in range(boat_parameters['noBoats'])]
            #solver.Add(solver.Sum(constraint_exp) <= 1)

def create_hints(variables, hints, juniors, no_boats, model):
    # Hints for X
    for i in range(len(juniors)):
        for b in range(no_boats):
            model.AddHint(variables['x'][i, b], hints['x'][str(i)][str(b)])
    
    # Hints for Y
    for i in range(len(juniors)):
        for j in range(len(juniors)):
            for b in range(no_boats):
                if i != j:
                    model.AddHint(variables['y'][i, j, b], hints['y'][str(i)][str(j)][str(b)])
        
def create_retval(variables, juniors, no_boats, solver):
    
    retval = {}
    retval['boats'] = {}
    
    
    for b in range(no_boats):
        retval['boats'][b] = []
        for i in range(len(juniors)):
            if solver.Value(variables['x'][i, b]) == 1:
            #if variables['x'][i, b].solution_value() == 1:
                retval['boats'][b].append(juniors[i]['name'])
                
    retval['success'] = True
    
    return retval
        
def get_current_variable_values(variables, juniors, no_boats, solver):
    current_values = {}
    
    current_values['x'] = {}
    for i in range(len(juniors)):
        current_values['x'][i] = {}
        for b in range(no_boats):
            current_values['x'][i][b] = solver.Value(variables['x'][i, b])
    
    current_values['y'] = {}
    for i in range(len(juniors)):
        current_values['y'][i] = {}
        for j in range(len(juniors)):
            current_values['y'][i][j] = {}
            for b in range(no_boats):
                if i != j:
                    current_values['y'][i][j][b] = solver.Value(variables['y'][i, j, b])

    return current_values    
    
    
    
        
    
# In Python, you can also set the constraints as follows.
# for i in range(number_of_constraints):
#  constraint_expr = coeffs[i][j] * x[j] for j in range(data['number_of_variables'])]
#  solver.Add(sum(constraint_expr) <= data['bounds'][i])

    
    
#serialize (skapa dict av dig själv) alla index i array
#jsonify