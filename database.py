import sqlite3
from datetime import datetime
import json
import os

class Database:
    def __init__(self, db_file="data.db"):
        self.db_file = db_file
        self.conn = None
        self.cursor = None

    def connect(self):
        """Estabelece conexão com o banco de dados"""
        self.conn = sqlite3.connect(self.db_file)
        self.conn.row_factory = sqlite3.Row
        self.cursor = self.conn.cursor()
        return self.conn

    def close(self):
        """Fecha a conexão com o banco de dados"""
        if self.conn:
            self.conn.close()
            self.conn = None
            self.cursor = None

    def init_db(self):
        """Inicializa o banco de dados criando todas as tabelas necessárias"""
        self.connect()
        try:
            # Tabela de plantas
            self.cursor.execute("""
                CREATE TABLE IF NOT EXISTS plant (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL UNIQUE,
                    description TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Tabela de processos
            self.cursor.execute("""
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
                    tempo_estimado INTEGER,
                    status TEXT DEFAULT 'em andamento',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (plant_id) REFERENCES plant(id)
                )
            """)

            # Tabela de dados dos sensores
            self.cursor.execute("""
                CREATE TABLE IF NOT EXISTS sensor_data (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    process_id INTEGER,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    sensor_type TEXT NOT NULL,
                    value REAL NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (process_id) REFERENCES process(id)
                )
            """)

            # Tabela de alertas
            self.cursor.execute("""
                CREATE TABLE IF NOT EXISTS alerts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    process_id INTEGER,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    alert_type TEXT NOT NULL,
                    message TEXT NOT NULL,
                    data TEXT,
                    is_resolved BOOLEAN DEFAULT 0,
                    resolved_at DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (process_id) REFERENCES process(id)
                )
            """)

            # Criar índices para melhor performance
            self.cursor.execute("CREATE INDEX IF NOT EXISTS idx_process_status ON process(status)")
            self.cursor.execute("CREATE INDEX IF NOT EXISTS idx_sensor_data_type ON sensor_data(sensor_type)")
            self.cursor.execute("CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(is_resolved)")
            self.cursor.execute("CREATE INDEX IF NOT EXISTS idx_process_plant ON process(plant_id)")

            self.conn.commit()
            print("Banco de dados inicializado com sucesso!")

        except Exception as e:
            print(f"Erro ao inicializar banco de dados: {e}")
            self.conn.rollback()
            raise
        finally:
            self.close()

    def migrate_db(self):
        """Executa migrações necessárias no banco de dados"""
        self.connect()
        try:
            # Verificar e atualizar estrutura da tabela alerts
            self.cursor.execute("PRAGMA table_info(alerts)")
            columns = [column[1] for column in self.cursor.fetchall()]
            
            if 'data' not in columns:
                print("Atualizando estrutura da tabela de alertas...")
                self.cursor.execute("""
                    CREATE TABLE alerts_new (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        process_id INTEGER,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                        alert_type TEXT NOT NULL,
                        message TEXT NOT NULL,
                        data TEXT,
                        is_resolved BOOLEAN DEFAULT 0,
                        resolved_at DATETIME,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (process_id) REFERENCES process(id)
                    )
                """)
                
                self.cursor.execute("""
                    INSERT INTO alerts_new (
                        id, process_id, timestamp, alert_type, message, 
                        is_resolved, resolved_at, created_at, updated_at
                    )
                    SELECT 
                        id, process_id, timestamp, alert_type, message,
                        is_resolved, resolved_at, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                    FROM alerts
                """)
                
                self.cursor.execute("DROP TABLE alerts")
                self.cursor.execute("ALTER TABLE alerts_new RENAME TO alerts")
                print("Estrutura da tabela de alertas atualizada com sucesso!")

            # Verificar e atualizar estrutura da tabela process
            self.cursor.execute("PRAGMA table_info(process)")
            columns = [column[1] for column in self.cursor.fetchall()]
            
            if 'tempo_estimado' not in columns:
                print("Atualizando estrutura da tabela process...")
                self.cursor.execute("""
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
                        tempo_estimado INTEGER,
                        status TEXT DEFAULT 'em andamento',
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (plant_id) REFERENCES plant(id)
                    )
                """)
                
                self.cursor.execute("""
                    INSERT INTO process_new (
                        id, plant_id, start_time, end_time, operator,
                        quantidade_materia_prima, parte_utilizada, temp_min,
                        temp_max, volume_extraido, rendimento, notas_operador,
                        status, created_at, updated_at
                    )
                    SELECT 
                        id, plant_id, start_time, end_time, operator,
                        quantidade_materia_prima, parte_utilizada, temp_min,
                        temp_max, volume_extraido, rendimento, notas_operador,
                        status, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                    FROM process
                """)
                
                self.cursor.execute("DROP TABLE process")
                self.cursor.execute("ALTER TABLE process_new RENAME TO process")
                print("Estrutura da tabela process atualizada com sucesso!")

            self.conn.commit()
            print("Migrações concluídas com sucesso!")

        except Exception as e:
            print(f"Erro ao executar migrações: {e}")
            self.conn.rollback()
            raise
        finally:
            self.close()

    def backup_db(self, backup_dir="backups"):
        """Cria um backup do banco de dados"""
        if not os.path.exists(backup_dir):
            os.makedirs(backup_dir)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = os.path.join(backup_dir, f"data_{timestamp}.db")
        
        try:
            # Conectar ao banco de dados original
            self.connect()
            
            # Criar backup
            with open(backup_file, 'w') as f:
                for line in self.conn.iterdump():
                    f.write(f'{line}\n')
            
            print(f"Backup criado com sucesso: {backup_file}")
            
        except Exception as e:
            print(f"Erro ao criar backup: {e}")
            raise
        finally:
            self.close()

    def restore_db(self, backup_file):
        """Restaura o banco de dados a partir de um backup"""
        try:
            # Conectar ao banco de dados
            self.connect()
            
            # Ler e executar o backup
            with open(backup_file, 'r') as f:
                self.conn.executescript(f.read())
            
            self.conn.commit()
            print(f"Backup restaurado com sucesso: {backup_file}")
            
        except Exception as e:
            print(f"Erro ao restaurar backup: {e}")
            self.conn.rollback()
            raise
        finally:
            self.close()

def init_database():
    """Função de inicialização do banco de dados"""
    db = Database()
    try:
        # Inicializar banco de dados
        db.init_db()
        
        # Executar migrações necessárias
        db.migrate_db()
        
        # Criar backup inicial
        db.backup_db()
        
        print("Banco de dados inicializado e configurado com sucesso!")
        
    except Exception as e:
        print(f"Erro ao inicializar banco de dados: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    # Executar inicialização quando o script for executado diretamente
    init_database() 