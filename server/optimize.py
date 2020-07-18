from flask import Blueprint, request, jsonify
from ortools.linear_solver import pywraplp
import numpy


bp = Blueprint('optimize', __name__)


@bp.route('/', methods=['POST'])
def recieve_data():
    solver = pywraplp.Solver('birka_solver', pywraplp.Solver.CBC_MIXED_INTEGER_PROGRAMMING)
    
    juniors = request.get_json()[0]
    boat_parameters = request.get_json()[1]
    constraints = request.get_json()[2]
    
    boat_parameters['minCrew'] = int(boat_parameters['minCrew'])
    boat_parameters['maxCrew'] = int(boat_parameters['maxCrew'])
    boat_parameters['noBoats'] = int(boat_parameters['noBoats'])
    
    print(constraints)
    print(boat_parameters)
    print(juniors)
    
    variables = {}
    variables['x'] = create_x_var(solver, juniors, boat_parameters['noBoats'])
    variables['y'] = create_y_var(solver, juniors, boat_parameters['noBoats'])
    variables['boat_used'] = create_boat_var(solver, boat_parameters['noBoats'])
    variables['worst_boat'] = solver.IntVar(0, 1, 'worst_boat')
    
    pref_matrix = create_pref_matrix(juniors)
    
    create_std_constraints(solver, variables, boat_parameters, juniors, pref_matrix)
    create_custom_constraints(solver, variables, constraints, juniors, boat_parameters)
    
    objective = solver.Objective()
    # In Python, you can also set the objective as follows.
    # obj_expr = [data['obj_coeffs'][j] * x[j] for j in range(data['num_vars'])]
    # solver.Maximize(solver.Sum(obj_expr))
    
    object_expression = [pref_matrix[i][j] * variables['y'][i, j, b] 
                         for i in range(len(juniors)) for j in range(len(juniors)) for b in range(boat_parameters['noBoats']) if j != i]
    solver.Maximize(variables['worst_boat'] + solver.Sum(object_expression))
    
    #maximize z : v + sum{i in JUNIORER, j in JUNIORER, b in BATAR} p[i,j]*y[i,j,b];
    
    
    status = solver.Solve()
    if status == pywraplp.Solver.OPTIMAL:
        print('Objective value =', solver.Objective().Value())
        
    else:
        print('The problem does not have an optimal solution.')
    
    return 'Ok', 200

#x[i, b] är 1 om jun i sitter i båt b, noll annars
def create_x_var(solver, juniors, no_boats):
    
    x = {}
    
    for i in range(len(juniors)):
        for b in range(no_boats):
            x[i, b] = solver.IntVar(0, 1, 'x[{}, Båt {}]'.format(i, b))
    
    return x

#y[i, j, b] är 1 om jun i sitter med jun j i båt b, noll annars
def create_y_var(solver, juniors, no_boats):
    
    y = {}
    
    for i in range(len(juniors)):
        for j in range(len(juniors)):
            for b in range(no_boats):
                if i != j:
                    y[i, j, b] = solver.IntVar(0, 1, 'y[{}, {}, Båt {}]'.format(i, j, b))
    
    return y

#boat_used[b] = 1 om båt b används, 0 f.ö.
def create_boat_var(solver, no_boats):
    boat_used = {}
    
    for b in range(no_boats):
        boat_used[b] = solver.IntVar(0, 1, 'boat_used[{}]'.format(b))
    
    return boat_used
 
#p[i, j] = 1 om junior i önskat att segla med junior j
def create_pref_matrix(juniors):
    p = numpy.zeros(shape=(len(juniors), len(juniors)))
    
    i = 0
    for junior_i in juniors:
        j = 0
        for junior_j in juniors:
            if junior_j['name'] in junior_i['wishes']:
                p[i][j] = 1
            j = j + 1
        i = i + 1
    
    return p
    
def create_std_constraints(solver, variables, boat_parameters, juniors, pref_matrix):
    #En junior i varje båt
    for i in range(len(juniors)):
        constraint_exp = [variables['x'][i, b] for b in range(boat_parameters['noBoats'])]
        solver.Add(solver.Sum(constraint_exp) == 1)
        
    #min capacity
    for b in range(boat_parameters['noBoats']):
        constraint_exp = [variables['x'][i, b] for i in range(len(juniors))]
        solver.Add(solver.Sum(constraint_exp) >= boat_parameters['minCrew'] * variables['boat_used'][b])
    
    #max capacity
    for b in range(boat_parameters['noBoats']):
        constraint_exp = [variables['x'][i, b] for i in range(len(juniors))]
        solver.Add(solver.Sum(constraint_exp) <= boat_parameters['maxCrew'] * variables['boat_used'][b])
        
    #Koppling x till y (jun i med jun j) -->
    for i in range(len(juniors)):
        for j in range(len(juniors)):
            for b in range(boat_parameters['noBoats']):
                if i != j:
                    solver.Add(2 * variables['y'][i, j, b] <= variables['x'][i, b] + variables['x'][j, b])
    
    #Sämsta båten --> målfunktion
    for b in range(boat_parameters['noBoats']):
        constraint_exp = [pref_matrix[i][j] * variables['y'][i, j, b] for i in range(len(juniors)) for j in range(len(juniors)) if j!= i] 
        solver.Add(variables['worst_boat'] <= solver.Sum(constraint_exp))
        
        
def create_custom_constraints(solver, variables, constraints, juniors, boat_parameters):
    for c in constraints:
        name1 = c['name1']
        name2 = c['name2']
        
        i = list(filter(lambda j: juniors[j]['name'] == name1, range(len(juniors))))[0]
        j = list(filter(lambda j: juniors[j]['name'] == name2, range(len(juniors))))[0]
        
        if c['mustSail']:
            constraint_exp = [variables['y'][i, j, b] for b in range(boat_parameters['noBoats'])]
            solver.Add(solver.Sum(constraint_exp) == 1)
        else:
            constraint_exp = [variables['x'][i, b] + variables['x'][j, b] for b in range(boat_parameters['noBoats'])]
            solver.Add(solver.Sum(constraint_exp) <= 1)
            
        
    
    
    
        
    
    
    
    
        
    
# In Python, you can also set the constraints as follows.
# for i in range(number_of_constraints):
#  constraint_expr = coeffs[i][j] * x[j] for j in range(data['number_of_variables'])]
#  solver.Add(sum(constraint_expr) <= data['bounds'][i])

    
    
#serialize (skapa dict av dig själv) alla index i array
#jsonify