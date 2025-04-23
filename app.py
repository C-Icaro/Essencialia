from flask import Flask
from config import BROKER_HOST, BROKER_PORT
from mqtt.mqtt_handler import start_mqtt, mqtt_data

app = Flask(__name__)
app.config["BROKER_HOST"] = BROKER_HOST
app.config["BROKER_PORT"] = BROKER_PORT

# Cria um contexto de aplicação para inicializar o cliente MQTT
with app.app_context():
    mqtt_client = start_mqtt(app.config["BROKER_HOST"], app.config["BROKER_PORT"])

from routes import *

if __name__ == "__main__":
    app.run(debug=True)