from app import app  # Importando o objeto app do arquivo app.py
from flask import render_template, jsonify  # Importando render_template e jsonify
from mqtt.mqtt_handler import mqtt_data  # Importando mqtt_data
import sqlite3  # Importando sqlite3
from datetime import datetime, timedelta

# Função para converter UTC para horário de Manaus (UTC-4)
def convert_to_manaus_time(utc_timestamp):
    # Converter string para datetime se necessário
    if isinstance(utc_timestamp, str):
        utc_timestamp = datetime.fromisoformat(utc_timestamp.replace('Z', '+00:00'))
    
    # Ajustar para horário de Manaus (UTC-4)
    manaus_time = utc_timestamp - timedelta(hours=4)
    return manaus_time.isoformat()

# Definindo rotas do web server

@app.route("/")  # Rota para a Home Page
def introducao():  # Função que será chamada quando a rota for acessada
    return render_template("introducao01.html")

@app.route("/home")  # Rota para a Home Page
def home():
    return render_template("home.html")

@app.route("/dashboard")  # Rota para o Dashboard
def dashboard():
    return render_template("dashboard.html")

@app.route("/biblioteca")  # Rota para a Biblioteca
def biblioteca():
    return render_template("biblioteca.html")

@app.route("/historico")  # Rota para o histórico
def historico():
    return render_template("historico.html")

@app.route("/suporte")  # Rota para o suporte
def suporte():
    return render_template("suporte.html")

@app.route("/mqtt-data")
def get_mqtt_data():
    return jsonify(mqtt_data)

@app.route("/temperature-data")
def get_temperature_data():
    conn = sqlite3.connect("data.db")
    cursor = conn.cursor()
    cursor.execute("SELECT timestamp, value FROM sensor_data WHERE sensor_type = 'temperature' ORDER BY timestamp ASC")
    rows = cursor.fetchall()
    conn.close()

    # Formatar os dados para o gráfico, convertendo timestamps
    data = {
        "timestamps": [convert_to_manaus_time(row[0]) for row in rows],
        "temperatures": [row[1] for row in rows]
    }
    return jsonify(data)

@app.route("/pressure-data")
def get_pressure_data():
    conn = sqlite3.connect("data.db")
    cursor = conn.cursor()
    cursor.execute("SELECT timestamp, value FROM sensor_data WHERE sensor_type = 'pressure' ORDER BY timestamp ASC")
    rows = cursor.fetchall()
    conn.close()
    
    # Formatar os dados para o gráfico, convertendo timestamps
    data = {
        "timestamps": [convert_to_manaus_time(row[0]) for row in rows],
        "pressures": [row[1] for row in rows]
    }
    return jsonify(data)

@app.route("/alerts")
def get_alerts():
    conn = sqlite3.connect("data.db")
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, timestamp, alert_type, message, is_resolved 
        FROM alerts 
        WHERE is_resolved = 0 
        ORDER BY timestamp DESC 
        LIMIT 10
    """)
    rows = cursor.fetchall()
    conn.close()
    
    alerts = [{
        "id": row[0],
        "timestamp": convert_to_manaus_time(row[1]),
        "type": row[2],
        "message": row[3],
        "is_resolved": bool(row[4])
    } for row in rows]
    
    return jsonify(alerts)

@app.route("/alerts/resolve/<int:alert_id>", methods=["POST"])
def resolve_alert(alert_id):
    conn = sqlite3.connect("data.db")
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE alerts 
        SET is_resolved = 1, resolved_at = CURRENT_TIMESTAMP 
        WHERE id = ?
    """, (alert_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

