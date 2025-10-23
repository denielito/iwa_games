from flask import Flask
from flask_sock import Sock
from .arduino_ws import sock

def create_app():
    app = Flask(__name__)
    from .routes import bp as routes_bp
    
    app.register_blueprint(routes_bp)

    sock.init_app(app)
    
    return app