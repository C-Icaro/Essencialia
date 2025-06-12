import sqlite3
import shutil
import os

DB_FILE = 'data.db'
BACKUP_FILE = 'data_backup_before_drop_eficiencia.db'

def create_tables():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    # Tabela de plantas
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS plant (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT
        )
    ''')
    # Tabela de processos
    cursor.execute('''
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
            FOREIGN KEY (plant_id) REFERENCES plant(id)
        )
    ''')
    # Tabela de dados dos sensores
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sensor_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            process_id INTEGER,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            sensor_type TEXT,
            value REAL,
            FOREIGN KEY (process_id) REFERENCES process(id)
        )
    ''')
    # Tabela de alertas
    cursor.execute('''
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
    ''')
    conn.commit()
    conn.close()
    print('Tabelas criadas/garantidas com sucesso!')

# Função para checar se a coluna existe
def column_exists(cursor, table, column):
    cursor.execute(f"PRAGMA table_info({table})")
    return any(row[1] == column for row in cursor.fetchall())

def drop_column_if_exists():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    if column_exists(cursor, 'process', 'eficiencia'):
        print("Removendo coluna 'eficiencia' da tabela 'process'...")
        print("FAÇA BACKUP DO BANCO ANTES DE CONTINUAR!")
        # Backup do banco
        shutil.copyfile(DB_FILE, BACKUP_FILE)
        # Obter colunas atuais exceto 'eficiencia'
        cursor.execute("PRAGMA table_info(process)")
        columns = [row[1] for row in cursor.fetchall() if row[1] != 'eficiencia']
        columns_str = ', '.join(columns)
        # Renomear tabela antiga
        cursor.execute("ALTER TABLE process RENAME TO process_old")
        # Criar nova tabela sem a coluna eficiencia
        cursor.execute('''
            CREATE TABLE process (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome_planta TEXT,
                quantidade_materia_prima REAL,
                parte_utilizada TEXT,
                temp_min REAL,
                temp_max REAL,
                tempo_estimado INTEGER,
                start_time TEXT,
                end_time TEXT,
                volume_extraido REAL,
                notas_operador TEXT,
                status TEXT
            )
        ''')
        # Copiar dados antigos
        cursor.execute(f"INSERT INTO process ({columns_str}) SELECT {columns_str} FROM process_old")
        cursor.execute("DROP TABLE process_old")
        conn.commit()
        print("Coluna 'eficiencia' removida com sucesso!")
    else:
        print("Coluna 'eficiencia' não existe. Nenhuma alteração feita.")
    conn.close()

# ATENÇÃO: Só execute este script manualmente quando realmente necessário!
# Ele NÃO deve ser rodado automaticamente ao iniciar o servidor.
# Sempre faça backup do banco antes de rodar!

def migrate():
    # Descomente a linha abaixo para criar as tabelas manualmente
    # create_tables()
    drop_column_if_exists()

if __name__ == '__main__':
    migrate() 