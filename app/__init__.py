from flask import Flask
#from flask_sqlalchemy import SQLAlchemy
#from flask_cors import CORS
#from sqlalchemy.pool import QueuePool
#import os
#from dotenv import load_dotenv
#
#load_dotenv()
#
#db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    
    """ # Configuración de la Base de Datos
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url:
        raise ValueError("DATABASE_URL no está configurada en las variables de entorno")
    
    # Para PostgreSQL en producción con Render
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    
    # Configuración del Pool de Conexiones para Render
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'poolclass': QueuePool,
        'pool_size': 5,                    # Número de conexiones mantenidas
        'max_overflow': 10,                # Conexiones adicionales permitidas
        'pool_recycle': 3600,              # Reciclar conexiones cada 1 hora
        'pool_pre_ping': True,             # Verificar conexiones antes de usarlas
        'echo': False,                     # Cambiar a True para debug
        'connect_args': {
            'connect_timeout': 10,
            'application_name': 'ingenioteca_app'
        }
    }
    
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Inicializar la base de datos
    #db.init_app(app)
    
    # Registrar blueprints """
    from .routes import bp as routes_bp
    #from .auth import bp as auth_bp
    
    app.register_blueprint(routes_bp)
    #app.register_blueprint(auth_bp)
    
    # Habilitar CORS
    #CORS(app)
    
    # Crear las tablas en el contexto de la aplicación
    #with app.app_context():
    #    db.create_all()
    
    return app