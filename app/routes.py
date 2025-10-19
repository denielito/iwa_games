from flask import Blueprint, render_template
import json
import os

bp = Blueprint('routes', __name__, url_prefix='/')

# Cargar datos de juegos
def cargar_juegos():
    ruta_json = os.path.join(os.path.dirname(__file__), '..', 'static', 'assets', 'data', 'juegos.json')
    with open(ruta_json, 'r', encoding='utf-8') as f:
        return json.load(f)

@bp.route('/')
def index():
    return render_template('index.html')

@bp.route('/<nombre_juego>')
def juego(nombre_juego):
    """Ruta dinámica para cualquier juego"""
    try:
        datos = cargar_juegos()
        juego_info = None
        
        # Buscar el juego en la lista
        for juego in datos['juegos']:
            # Usar el nombre del HTML sin extensión como identificador
            nombre_archivo = juego['html'].replace('.html', '')
            if nombre_archivo == nombre_juego:
                juego_info = juego
                break
        
        if not juego_info:
            return "Juego no encontrado", 404
        
        # Renderizar el template del juego
        return render_template(juego_info['html'])
    
    except Exception as e:
        print(f"Error cargando juego: {e}")
        return "Error al cargar el juego", 500

# Rutas específicas (opcional, para acceso directo)
@bp.route('/resistencia')
def resistencia():
    return render_template('resistencia.html')

@bp.route('/ecoinvernadero')
def ecoinvernadero():
    return render_template('ecoinvernadero.html')

@bp.route('/carrera-extrema')
def carrera_extrema():
    return render_template('carrera-extrema.html')