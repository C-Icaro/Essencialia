import sqlite3
import paho.mqtt.client as mqtt
import json

# Variáveis globais para armazenar os dados recebidos
mqtt_data = {
    "temperatura": "Carregando...",
    "nivel": "Carregando...",
    "pressao_kPa": "Carregando..."
}

# Configuração do banco de dados SQLite
DB_FILE = "data.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS temperature_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            temperature REAL
        )
    """)
    conn.commit()
    conn.close()

def save_temperature_to_db(temperature):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO temperature_data (temperature) VALUES (?)", (temperature,))
    conn.commit()
    conn.close()

# Funções MQTT
def on_connect(client, userdata, flags, rc):
    print("Conectado ao broker MQTT")
    client.subscribe("essencialia/dados")

def on_message(client, userdata, msg):
    global mqtt_data
    try:
        payload = json.loads(msg.payload.decode())
        mqtt_data["temperatura"] = f"{payload.get('temperatura', 'N/A')} °C"
        mqtt_data["nivel"] = payload.get("nivel", "N/A")
        mqtt_data["pressao_kPa"] = f"{payload.get('pressao_kPa', 'N/A')} kPa"

        # Salvar temperatura no banco de dados
        save_temperature_to_db(payload.get("temperatura", 0))
        print(f"Dados atualizados: {mqtt_data}")
    except json.JSONDecodeError:
        print("Erro ao decodificar a mensagem MQTT")

def start_mqtt(broker_host, broker_port):
    init_db()  # Inicializa o banco de dados
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(broker_host, broker_port, 60)
    client.loop_start()
    return client