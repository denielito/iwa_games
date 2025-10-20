from flask import Blueprint, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from .models import Usuario, db
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import os

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Decorador para verificar si el usuario está autenticado
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'usuario_id' not in session:
            return jsonify({'error': 'No autenticado'}), 401
        return f(*args, **kwargs)
    return decorated_function

@bp.route('/registro', methods=['POST'])
def registro():
    """Registrar un nuevo usuario"""
    try:
        datos = request.get_json()
        
        # Validar que los campos requeridos estén presentes
        if not datos or not all(key in datos for key in ['nombre', 'apodo', 'contraseña']):
            return jsonify({'error': 'Faltan campos requeridos'}), 400
        
        nombre = datos.get('nombre', '').strip()
        apodo = datos.get('apodo', '').strip()
        contraseña = datos.get('contraseña', '').strip()
        
        # Validaciones básicas
        if len(nombre) < 2:
            return jsonify({'error': 'El nombre debe tener al menos 2 caracteres'}), 400
        
        if len(apodo) < 3:
            return jsonify({'error': 'El apodo debe tener al menos 3 caracteres'}), 400
        
        if len(contraseña) < 6:
            return jsonify({'error': 'La contraseña debe tener al menos 6 caracteres'}), 400
        
        # Verificar si el apodo ya existe
        usuario_existente = Usuario.query.filter_by(apodo=apodo).first()
        if usuario_existente:
            return jsonify({'error': 'El apodo ya está en uso'}), 409
        
        # Crear nuevo usuario
        nuevo_usuario = Usuario(nombre=nombre, apodo=apodo)
        nuevo_usuario.contraseña = contraseña  # Usa el setter que hashea la contraseña
        
        db.session.add(nuevo_usuario)
        db.session.commit()
        
        return jsonify({
            'mensaje': 'Usuario registrado exitosamente',
            'usuario_id': nuevo_usuario.id,
            'apodo': nuevo_usuario.apodo
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al registrar: {str(e)}'}), 500

@bp.route('/ingreso', methods=['POST'])
def ingreso():
    """Iniciar sesión"""
    try:
        datos = request.get_json()
        
        # Validar campos requeridos
        if not datos or not all(key in datos for key in ['apodo', 'contraseña']):
            return jsonify({'error': 'Faltan campos requeridos'}), 400
        
        apodo = datos.get('apodo', '').strip()
        contraseña = datos.get('contraseña', '').strip()
        
        # Buscar usuario
        usuario = Usuario.query.filter_by(apodo=apodo).first()
        
        if not usuario or not usuario.verificar_contraseña(contraseña):
            return jsonify({'error': 'Apodo o contraseña incorrectos'}), 401
        
        # Crear sesión
        session['usuario_id'] = usuario.id
        session['apodo'] = usuario.apodo
        session.permanent = True
        
        return jsonify({
            'mensaje': 'Sesión iniciada exitosamente',
            'usuario_id': usuario.id,
            'apodo': usuario.apodo,
            'nombre': usuario.nombre
        }), 200
    
    except Exception as e:
        return jsonify({'error': f'Error al iniciar sesión: {str(e)}'}), 500

@bp.route('/logout', methods=['POST'])
@login_required
def logout():
    """Cerrar sesión"""
    try:
        session.clear()
        return jsonify({'mensaje': 'Sesión cerrada exitosamente'}), 200
    except Exception as e:
        return jsonify({'error': f'Error al cerrar sesión: {str(e)}'}), 500

@bp.route('/perfil', methods=['GET'])
@login_required
def obtener_perfil():
    """Obtener datos del usuario autenticado"""
    try:
        usuario_id = session.get('usuario_id')
        usuario = Usuario.query.get(usuario_id)
        
        if not usuario:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        return jsonify({
            'usuario_id': usuario.id,
            'nombre': usuario.nombre,
            'apodo': usuario.apodo
        }), 200
    
    except Exception as e:
        return jsonify({'error': f'Error al obtener perfil: {str(e)}'}), 500

@bp.route('/verificar-sesion', methods=['GET'])
def verificar_sesion():
    """Verificar si hay una sesión activa"""
    if 'usuario_id' in session:
        return jsonify({
            'autenticado': True,
            'usuario_id': session.get('usuario_id'),
            'apodo': session.get('apodo')
        }), 200
    return jsonify({'autenticado': False}), 200