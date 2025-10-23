from flask_sock import Sock
from .arduino_connection import get_latest_data
import time
import json

sock = Sock()

@sock.route('/ws')
def websocket(ws):
    while True:
        data = get_latest_data()
        if data:
            ws.send(json.dumps(data))
        time.sleep(1)
