import sqlite3
import paho.mqtt.client as mqtt
import json
from datetime import datetime

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
            quantidade_materia_prima REAL,
            parte_utilizada TEXT,
            temp_min REAL,
            temp_max REAL,
            volume_extraido REAL,
            rendimento REAL,
            notas_operador TEXT,
            status TEXT DEFAULT 'em andamento',
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
            data TEXT,
            is_resolved BOOLEAN DEFAULT 0,
            resolved_at DATETIME,
            FOREIGN KEY (process_id) REFERENCES process(id)
        )
    """)
    conn.commit()
    conn.close()

# Recriar a tabela de alertas se necessário
def recreate_alerts_table():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Verificar se a coluna data existe
    cursor.execute("PRAGMA table_info(alerts)")
    columns = [column[1] for column in cursor.fetchall()]
    
    if 'data' not in columns:
        print("Atualizando estrutura da tabela de alertas...")
        # Criar tabela temporária com a nova estrutura
        cursor.execute("""
            CREATE TABLE alerts_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                process_id INTEGER,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                alert_type TEXT NOT NULL,
                message TEXT NOT NULL,
                data TEXT,
                is_resolved BOOLEAN DEFAULT 0,
                resolved_at DATETIME,
                FOREIGN KEY (process_id) REFERENCES process(id)
            )
        """)
        
        # Copiar dados existentes
        cursor.execute("""
            INSERT INTO alerts_new (id, process_id, timestamp, alert_type, message, is_resolved, resolved_at)
            SELECT id, process_id, timestamp, alert_type, message, is_resolved, resolved_at
            FROM alerts
        """)
        
        # Remover tabela antiga e renomear a nova
        cursor.execute("DROP TABLE alerts")
        cursor.execute("ALTER TABLE alerts_new RENAME TO alerts")
        
        conn.commit()
        print("Estrutura da tabela de alertas atualizada com sucesso!")
    
    conn.close()

# ATENÇÃO: Nunca chame recreate_process_table automaticamente!
# Use apenas manualmente, com backup, e ajuste o SELECT para copiar todos os campos se necessário.
# def recreate_process_table():
#     ...

# Inicializar banco de dados e atualizar estrutura se necessário
init_db()
recreate_alerts_table()

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

def get_current_process_id():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM process WHERE status = 'em andamento'")
    row = cursor.fetchone()
    conn.close()
    return row[0] if row else None

# Funções MQTT
def on_connect(client, userdata, flags, rc):
    print("Conectado ao broker MQTT")
    client.subscribe("essencialia/dados")
    client.subscribe("essencialia/alertas")
    client.subscribe("essencialia/falhas")

def on_message(client, userdata, msg):
    global mqtt_data
    try:
        # Processar alertas e falhas
        if msg.topic in ["essencialia/alertas", "essencialia/falhas"]:
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            try:
                payload_str = msg.payload.decode()
                try:
                    alerta = json.loads(payload_str)
                    # Mensagem JSON estruturada
                    alert_type = alerta.get('type') or alerta.get('tipo') or ('falha' if msg.topic.endswith('falhas') else 'alerta')
                    message = alerta.get('message') or alerta.get('mensagem') or alerta.get('solucao') or payload_str
                    data = alerta.get('data') or alerta
                except json.JSONDecodeError:
                    # Mensagem em texto puro
                    alert_type = 'alerta' if msg.topic.endswith('alertas') else 'falha'
                    message = payload_str
                    data = None
                cursor.execute("""
                    INSERT INTO alerts (process_id, alert_type, message, data, timestamp)
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    None,
                    alert_type,
                    message,
                    json.dumps(data) if data else None,
                    datetime.now().isoformat()
                ))
                conn.commit()
                print(f"Alerta/Falha salva: {message}")
            except Exception as e:
                print(f"Erro ao processar alerta/falha: {e}")
            finally:
                conn.close()
            return

        # Processar dados normais dos sensores
        payload = json.loads(msg.payload.decode())
        mqtt_data["temperatura"] = f"{payload.get('temperatura', 'N/A')} °C"
        mqtt_data["nivel"] = payload.get("nivel", "N/A")
        mqtt_data["pressao_kPa"] = f"{payload.get('pressao_kPa', 'N/A')} kPa"

        # Buscar o process_id do processo em andamento
        process_id = get_current_process_id()

        # Salvar temperatura, pressão e nível de água no banco de dados, referenciando o processo
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO sensor_data (process_id, sensor_type, value) VALUES (?, ?, ?)", (process_id, 'temperature', payload.get("temperatura", 0)))
        cursor.execute("INSERT INTO sensor_data (process_id, sensor_type, value) VALUES (?, ?, ?)", (process_id, 'pressure', payload.get("pressao_kPa", 0)))
        # Nível de água: converter para valor numérico se possível
        nivel = payload.get("nivel", None)
        if nivel is not None:
            if isinstance(nivel, (int, float)):
                nivel_val = float(nivel)
            elif isinstance(nivel, str):
                if nivel.upper() == "ALTO":
                    nivel_val = 1.0
                elif nivel.upper() == "BAIXO":
                    nivel_val = 0.0
                else:
                    try:
                        nivel_val = float(nivel)
                    except Exception:
                        nivel_val = None
            else:
                nivel_val = None
            if nivel_val is not None:
                cursor.execute("INSERT INTO sensor_data (process_id, sensor_type, value) VALUES (?, ?, ?)", (process_id, 'water_level', nivel_val))
        conn.commit()
        conn.close()
        print(f"Dados salvos: temperatura={payload.get('temperatura', 0)}, pressao={payload.get('pressao_kPa', 0)}, nivel={nivel}")
    except Exception as e:
        print(f"Erro ao processar mensagem MQTT: {e}")

def start_mqtt(broker_host, broker_port):
    init_db()  # Inicializa o banco de dados
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(broker_host, broker_port, 60)
    client.loop_start()
    return client