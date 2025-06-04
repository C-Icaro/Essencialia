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

def recreate_process_table():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Verificar se a tabela existe
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='process'")
    if cursor.fetchone():
        # Criar tabela temporária com a nova estrutura
        cursor.execute("""
            CREATE TABLE process_new (
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
                tempo_estimado INTEGER,  -- Novo campo: tempo estimado em minutos
                status TEXT DEFAULT 'em andamento',
                FOREIGN KEY (plant_id) REFERENCES plant(id)
            )
        """)
        
        # Copiar dados existentes
        cursor.execute("""
            INSERT INTO process_new (
                id, plant_id, start_time, end_time, operator, status
            )
            SELECT 
                id, plant_id, start_time, end_time, operator, 
                CASE 
                    WHEN end_time IS NULL THEN 'em andamento'
                    ELSE 'finalizado'
                END as status
            FROM process
        """)
        
        # Remover tabela antiga e renomear a nova
        cursor.execute("DROP TABLE process")
        cursor.execute("ALTER TABLE process_new RENAME TO process")
        
        conn.commit()
        print("Estrutura da tabela process atualizada com sucesso!")
    else:
        # Se a tabela não existir, criar com a nova estrutura
        cursor.execute("""
            CREATE TABLE process (
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
                tempo_estimado INTEGER,  -- Novo campo: tempo estimado em minutos
                status TEXT DEFAULT 'em andamento',
                FOREIGN KEY (plant_id) REFERENCES plant(id)
            )
        """)
        conn.commit()
        print("Tabela process criada com sucesso!")
    
    conn.close()

# Inicializar banco de dados e atualizar estrutura se necessário
init_db()
recreate_alerts_table()
recreate_process_table()

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

        # Salvar temperatura e pressão no banco de dados
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO sensor_data (process_id, sensor_type, value) VALUES (?, ?, ?)", (None, 'temperature', payload.get("temperatura", 0)))
        cursor.execute("INSERT INTO sensor_data (process_id, sensor_type, value) VALUES (?, ?, ?)", (None, 'pressure', payload.get("pressao_kPa", 0)))
        conn.commit()
        conn.close()
        print(f"Dados salvos: temperatura={payload.get('temperatura', 0)}, pressao={payload.get('pressao_kPa', 0)}")
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