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
    
    print(variables)
    print(pref_matrix)
    
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
    
def create_std_constraints(solver, variables):
    #En junior i varje båt
    for i in range(juniors):
        constraint_exp = variables['x'][i][b] for b in no_boats
        solver.Add(sum(constraint_exp) = 1)
        
    
# In Python, you can also set the constraints as follows.
# for i in range(number_of_constraints):
#  constraint_expr = coeffs[i][j] * x[j] for j in range(data['number_of_variables'])]
#  solver.Add(sum(constraint_expr) <= data['bounds'][i])

    
    
#serialize (skapa dict av dig själv) alla index i array
#jsonify