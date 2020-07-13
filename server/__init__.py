from flask import Flask

app = Flask(__name__, static_folder='../client', static_url_path='/')

#app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
#app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

from server.juniors import bp as juniors_bp

app.register_blueprint(juniors_bp, url_prefix='/juniors')


@app.route("/")
def client():
    return app.send_static_file("birka.html")
