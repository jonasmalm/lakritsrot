from flask import Blueprint


bp = Blueprint('juniors', __name__)



@bp.route('/add', methods=['POST'])
def search():
    print('Hello')