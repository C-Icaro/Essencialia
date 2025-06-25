from flask import Flask, render_template, request, jsonify, g
from config import BROKER_HOST, BROKER_PORT
from mqtt.mqtt_handler import start_mqtt, mqtt_data
import sqlite3
from datetime import datetime, timedelta, timezone
import os
import socket

app = Flask(__name__)
app.config["BROKER_HOST"] = BROKER_HOST
app.config["BROKER_PORT"] = BROKER_PORT

# Inicializa o cliente MQTT
with app.app_context():
    mqtt_client = start_mqtt(app.config["BROKER_HOST"], app.config["BROKER_PORT"])

def get_db_connection():
    conn = sqlite3.connect('data.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.before_request
def check_processo_em_andamento():
    g.processo_em_andamento = get_processo_em_andamento()

def get_processo_em_andamento():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM process WHERE status = 'em andamento'")
    processo = cursor.fetchone()
    conn.close()
    return processo

def ensure_finish_time_column():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(process)")
    columns = [col[1] for col in cursor.fetchall()]
    if 'finish_time' not in columns:
        cursor.execute("ALTER TABLE process ADD COLUMN finish_time DATETIME")
        conn.commit()
    conn.close()

# Garante que a coluna finish_time existe ao iniciar o app
ensure_finish_time_column()

@app.route('/api/process', methods=['POST'])
def create_process():
    try:
        # Verificar se já existe um processo em andamento
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, plant_id, start_time, operator 
            FROM process 
            WHERE status = 'em andamento'
        ''')
        processo_em_andamento = cursor.fetchone()
        
        if processo_em_andamento:
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Já existe um processo em andamento. Finalize o processo atual antes de iniciar um novo.'
            }), 400
        
        # Se não houver processo em andamento, continua com a criação
        data = request.json
        
        # Get plant_id from plant name
        cursor.execute('SELECT id FROM plant WHERE name = ?', (data['planta'],))
        plant = cursor.fetchone()
        if not plant:
            # Create new plant if it doesn't exist
            cursor.execute('INSERT INTO plant (name) VALUES (?)', (data['planta'],))
            plant_id = cursor.lastrowid
        else:
            plant_id = plant['id']
        
        # Calcular o tempo estimado usando a fórmula: 0.12 * massa + 20
        quantidade = float(data['quantidade'])
        tempo_estimado = round(0.12 * quantidade + 20)
        
        # Usar UTC para start_time e finish_time
        start_dt = datetime.utcnow().replace(tzinfo=timezone.utc)
        finish_time = start_dt + timedelta(minutes=tempo_estimado)

        # Insert new process com start_time e finish_time
        cursor.execute('''
            INSERT INTO process (
                plant_id, operator, quantidade_materia_prima, 
                parte_utilizada, temp_min, temp_max, tempo_estimado, status, start_time, finish_time
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            plant_id,
            data.get('operator', ''),
            quantidade,
            data['parte'],
            float(data['temp_min']),
            float(data['temp_max']),
            tempo_estimado,
            'em andamento',
            start_dt.isoformat(),
            finish_time.isoformat()
        ))
        process_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'process_id': process_id,
            'message': 'Processo iniciado com sucesso'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/process/<int:process_id>/finish', methods=['POST'])
def finish_process(process_id):
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()

        # Verificar status atual do processo
        cursor.execute('SELECT status, quantidade_materia_prima FROM process WHERE id = ?', (process_id,))
        row_status = cursor.fetchone()
        status_atual = row_status['status'] if row_status else None
        quantidade_materia_prima = float(row_status['quantidade_materia_prima']) if row_status and row_status['quantidade_materia_prima'] else 0

        # Obter volume extraído enviado pelo frontend
        volume_extraido = float(data.get('volume_extraido') or 0)
        # Calcular rendimento
        rendimento = (volume_extraido / quantidade_materia_prima) * 100 if quantidade_materia_prima > 0 else 0
        # Definir nota padrão se não enviada
        notas_operador = data.get('notas_operador', '').strip()
        if not notas_operador:
            notas_operador = 'Processo finalizado sem notas adicionais'

        if status_atual == 'finalizado':
            # Permitir atualizar apenas volume_extraido, rendimento e notas_operador
            cursor.execute('''
                UPDATE process 
                SET volume_extraido = ?,
                    rendimento = ?,
                    notas_operador = ?
                WHERE id = ?
            ''', (
                volume_extraido,
                rendimento,
                notas_operador,
                process_id
            ))
            conn.commit()
            conn.close()
            return jsonify({'success': True, 'message': 'Produção registrada após finalização automática'})

        # Update process with final data (finalização normal)
        end_time = datetime.utcnow().replace(tzinfo=timezone.utc).isoformat()
        cursor.execute('''
            UPDATE process 
            SET end_time = ?,
                volume_extraido = ?,
                rendimento = ?,
                notas_operador = ?,
                status = 'finalizado'
            WHERE id = ?
        ''', (
            end_time,
            volume_extraido,
            rendimento,
            notas_operador,
            process_id
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Processo finalizado com sucesso'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/process', methods=['GET'])
def get_processes():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Busca todos os processos com o nome da planta
        cursor.execute('''
            SELECT 
                p.*,
                pl.name as plant_name
            FROM process p
            LEFT JOIN plant pl ON p.plant_id = pl.id
            ORDER BY p.start_time DESC
        ''')
        
        processes = []
        for row in cursor.fetchall():
            process = dict(row)
            # NÃO formatar as datas para exibição, apenas retornar como estão no banco (ISO)
            # if process['start_time']:
            #     process['start_time'] = datetime.fromisoformat(process['start_time']).strftime('%d/%m/%Y %H:%M:%S')
            # if process['end_time']:
            #     process['end_time'] = datetime.fromisoformat(process['end_time']).strftime('%d/%m/%Y %H:%M:%S')
            processes.append(process)
        
        conn.close()
        return jsonify({
            'success': True,
            'processes': processes
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route("/api/alerts", methods=["POST"])
def create_alert():
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({"error": "Mensagem é obrigatória"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO alerts (alert_type, message, timestamp)
            VALUES (?, ?, CURRENT_TIMESTAMP)
        """, (
            data.get('type', 'info'),
            data['message']
        ))
        
        alert_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True,
            "alert_id": alert_id,
            "message": "Alerta criado com sucesso"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/process/<int:process_id>/update_time', methods=['POST'])
def update_process_time(process_id):
    try:
        data = request.json
        tempo_estimado = data.get('tempo_estimado')
        if tempo_estimado is not None:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('UPDATE process SET tempo_estimado = ? WHERE id = ? AND status = "em andamento"', (tempo_estimado, process_id))
            conn.commit()
            conn.close()
            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'error': 'tempo_estimado é obrigatório'}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/process/active', methods=['GET'])
def process_active():
    processo = get_processo_em_andamento()
    if processo:
        # Verifica se o tempo já passou
        if processo['start_time'] and processo['tempo_estimado']:
            # start_time pode estar em formato ISO ou string, garantir datetime
            if isinstance(processo['start_time'], str):
                try:
                    start_dt = datetime.fromisoformat(processo['start_time'])
                except Exception:
                    # Tenta formato dd/mm/yyyy HH:MM:SS
                    try:
                        start_dt = datetime.strptime(processo['start_time'], '%d/%m/%Y %H:%M:%S')
                    except Exception:
                        start_dt = None
            else:
                start_dt = processo['start_time']
            if start_dt:
                now = datetime.utcnow().replace(tzinfo=timezone.utc)
                diff_minutes = (now - start_dt).total_seconds() / 60
                if diff_minutes > processo['tempo_estimado']:
                    # Finaliza o processo automaticamente
                    conn = get_db_connection()
                    cursor = conn.cursor()
                    cursor.execute('''
                        UPDATE process SET end_time = ?, status = 'finalizado', notas_operador = ?
                        WHERE id = ?
                    ''', (now.isoformat(), 'Processo finalizado sem notas adicionais', processo['id']))
                    conn.commit()
                    conn.close()
                    return jsonify({'active': False, 'process': None, 'auto_finished': True})
    return jsonify({
        'active': bool(processo),
        'process': dict(processo) if processo else None
    })

@app.route('/api/process/<int:process_id>', methods=['DELETE'])
def delete_process(process_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM process WHERE id = ?', (process_id,))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Processo excluído com sucesso'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

from routes import *

if __name__ == "__main__":
    def get_local_ip():
        """Obtém o IP local da máquina na rede"""
        try:
            # Método 1: Tentar conectar ao Google (requer internet)
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            local_ip = s.getsockname()[0]
            s.close()
            return local_ip
        except Exception:
            try:
                # Método 2: Usar hostname para descobrir IP (não requer internet)
                hostname = socket.gethostname()
                local_ip = socket.gethostbyname(hostname)
                # Verificar se não é 127.0.0.1
                if local_ip != "127.0.0.1":
                    return local_ip
            except Exception:
                pass
            
            try:
                # Método 3: Listar todas as interfaces de rede
                import subprocess
                import platform
                
                if platform.system() == "Windows":
                    # Windows: usar ipconfig
                    result = subprocess.run(['ipconfig'], capture_output=True, text=True)
                    lines = result.stdout.split('\n')
                    for line in lines:
                        if 'IPv4' in line and '192.168.' in line:
                            # Extrair IP da linha
                            ip = line.split(':')[-1].strip()
                            if ip and ip != '127.0.0.1':
                                return ip
                else:
                    # Linux/Mac: usar ifconfig ou ip addr
                    try:
                        result = subprocess.run(['ip', 'addr'], capture_output=True, text=True)
                        lines = result.stdout.split('\n')
                        for line in lines:
                            if 'inet ' in line and '192.168.' in line:
                                ip = line.split()[1].split('/')[0]
                                if ip != '127.0.0.1':
                                    return ip
                    except:
                        # Fallback para ifconfig
                        result = subprocess.run(['ifconfig'], capture_output=True, text=True)
                        lines = result.stdout.split('\n')
                        for line in lines:
                            if 'inet ' in line and '192.168.' in line:
                                ip = line.split()[1]
                                if ip != '127.0.0.1':
                                    return ip
            except Exception:
                pass
            
            # Se todos os métodos falharem, retorna localhost
            return "127.0.0.1"
    
    local_ip = get_local_ip()
    port = 5000
    
    print("=" * 60)
    print("🚀 Servidor Essencialia iniciado!")
    print("=" * 60)
    print(f"📍 Acesso local:     http://localhost:{port}")
    print(f"🌐 Acesso na rede:   http://{local_ip}:{port}")
    print("=" * 60)
    print("💡 Para acessar de outros dispositivos na mesma rede,")
    print("   use o endereço 'Acesso na rede' acima.")
    print("=" * 60)
    
    app.run(debug=True, host='0.0.0.0', port=port)