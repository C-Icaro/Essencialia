import sqlite3
import shutil
import os

DB_FILE = 'data.db'
BACKUP_FILE = 'data_backup_before_drop_eficiencia.db'

# Função para checar se a coluna existe
def column_exists(cursor, table, column):
    cursor.execute(f"PRAGMA table_info({table})")
    return any(row[1] == column for row in cursor.fetchall())

def drop_column_if_exists():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    if column_exists(cursor, 'process', 'eficiencia'):
        print("Removendo coluna 'eficiencia' da tabela 'process'...")
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

def migrate():
    drop_column_if_exists()

if __name__ == '__main__':
    migrate() 