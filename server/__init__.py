from flask import Flask

app = Flask(__name__, static_folder='../client', static_url_path='/')

#app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
#app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

from server.optimize import bp as optimize_bp

app.register_blueprint(optimize_bp, url_prefix='/optimize')


@app.route("/")
def client():
    return app.send_static_file("birka.html")
