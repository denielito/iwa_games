from . import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class Usuario(db.Model):
    __tablename__ = 'usuarios'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(100), nullable=False)
    apodo = db.Column(db.String(50), unique=True, nullable=False, index=True)
    contraseña_hash = db.Column(db.String(255), nullable=False)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    fecha_ultima_sesion = db.Column(db.DateTime)
    activo = db.Column(db.Boolean, default=True, nullable=False)

    def __repr__(self):
        return f'<Usuario {self.apodo}>'

    @property
    def contraseña(self):
        raise AttributeError('La contraseña no se puede leer directamente.')

    @contraseña.setter
    def contraseña(self, password_plano):
        self.contraseña_hash = generate_password_hash(password_plano, method='pbkdf2:sha256')

    def verificar_contraseña(self, password_plano):
        return check_password_hash(self.contraseña_hash, password_plano)

    def to_dict(self):
        """Convertir modelo a diccionario"""
        return {
            'id': self.id,
            'nombre': self.nombre,
            'apodo': self.apodo,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            'activo': self.activo
        }