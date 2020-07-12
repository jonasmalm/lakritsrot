from flask import Flask

app = Flask(__name__, static_folder='../client', static_url_path='/')

#app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
#app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

#from x import bp as x_bp

#app.register_blueprint(x_bp, url_prefix='/x')


@app.route("/")
def client():
    return app.send_static_file("home.html")
