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
    # Nova modelagem
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS plant (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS process (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plant_id INTEGER,
            start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            end_time DATETIME,
            operator TEXT,
            FOREIGN KEY (plant_id) REFERENCES plant(id)
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sensor_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            process_id INTEGER,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            sensor_type TEXT,
            value REAL,
            FOREIGN KEY (process_id) REFERENCES process(id)
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            process_id INTEGER,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            alert_type TEXT NOT NULL,
            message TEXT NOT NULL,
            is_resolved BOOLEAN DEFAULT 0,
            resolved_at DATETIME,
            FOREIGN KEY (process_id) REFERENCES process(id)
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

def save_pressure_to_db(pressure):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO pressure_data (pressure) VALUES (?)", (pressure,))
    conn.commit()
    conn.close()

# Funções MQTT
def on_connect(client, userdata, flags, rc):
    print("Conectado ao broker MQTT")
    client.subscribe("essencialia/dados")

def on_message(client, userdata, msg):
    global mqtt_data
    try:
        # Verificar se é um tópico de alerta
        if msg.topic == "essencialia/alertas":
            # Salvar alerta no banco de dados
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            
            # Determinar o tipo de alerta baseado na mensagem
            alert_type = "info"
            message = msg.payload.decode()
            
            if "temperatura" in message.lower():
                alert_type = "temperature"
            elif "pressao" in message.lower():
                alert_type = "pressure"
            elif "nivel" in message.lower():
                alert_type = "water_level"
            
            # Inserir alerta
            cursor.execute("""
                INSERT INTO alerts (process_id, alert_type, message)
                VALUES (?, ?, ?)
            """, (None, alert_type, message))
            
            conn.commit()
            conn.close()
            print(f"Alerta salvo: {message}")
            return

        # Processar dados normais dos sensores
        payload = json.loads(msg.payload.decode())
        mqtt_data["temperatura"] = f"{payload.get('temperatura', 'N/A')} °C"
        mqtt_data["nivel"] = payload.get("nivel", "N/A")
        mqtt_data["pressao_kPa"] = f"{payload.get('pressao_kPa', 'N/A')} kPa"

        # Salvar temperatura e pressão no banco de dados
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO sensor_data (process_id, sensor_type, value) VALUES (?, ?, ?)", (None, 'temperature', payload.get("temperatura", 0)))
        cursor.execute("INSERT INTO sensor_data (process_id, sensor_type, value) VALUES (?, ?, ?)", (None, 'pressure', payload.get("pressao_kPa", 0)))
        conn.commit()
        conn.close()
        print(f"Dados salvos: temperatura={payload.get('temperatura', 0)}, pressao={payload.get('pressao_kPa', 0)}")
    except json.JSONDecodeError:
        print("Erro ao decodificar a mensagem MQTT")
    except Exception as e:
        print(f"Erro ao processar mensagem MQTT: {str(e)}")

def start_mqtt(broker_host, broker_port):
    init_db()  # Inicializa o banco de dados
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(broker_host, broker_port, 60)
    client.loop_start()
    return client