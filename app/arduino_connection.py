import serial
import threading
import time
from queue import Queue

serial_conn = None
data_queue = Queue()

def connect_arduino(port, baudrate=9600):
    """Intenta conectar al puerto especificado"""
    global serial_conn
    try:
        serial_conn = serial.Serial(port, baudrate, timeout=1)
        threading.Thread(target=read_from_serial, daemon=True).start()
        return True, f"Conectado al puerto {port}"
    except Exception as e:
        return False, str(e)

def disconnect_arduino():
    """Cierra la conexión serial si está activa"""
    global serial_conn
    if serial_conn and serial_conn.is_open:
        serial_conn.close()
        serial_conn = None
        return True, "Arduino desconectado"
    return False, "No hay conexión activa"

def read_from_serial():
    """Lee continuamente los datos del Arduino y los almacena en la cola"""
    global serial_conn
    while serial_conn and serial_conn.is_open:
        try:
            line = serial_conn.readline().decode('utf-8').strip()
            if not line:
                continue

            # Esperamos un formato como: temp,humedad,agua,s1,s2,s3,s4,s5,s6
            values = line.split(',')
            if len(values) != 9:
                continue  # línea incompleta o corrupta

            temperatura = float(values[0])
            humedad_aire = float(values[1])
            distancia = float(values[2])
            suelo = [float(v) for v in values[3:9]]

            # Convertir distancia (cm) a "agua" (L) o nivel según tus reglas
            agua = round(max(0, 10 - distancia), 2)  # Ejemplo: inversamente proporcional

            data = {
                "temp": temperatura,
                "hum": humedad_aire,
                "agua": agua,
                "suelo": suelo
            }

            data_queue.put(data)

        except ValueError:
            # Si ocurre error de conversión, ignorar línea
            continue
        except Exception:
            time.sleep(0.1)
            continue

def get_latest_data():
    """Devuelve el último paquete de datos disponibles"""
    if not data_queue.empty():
        # Vaciar cola y devolver el último
        last_data = None
        while not data_queue.empty():
            last_data = data_queue.get()
        return last_data
    return None
