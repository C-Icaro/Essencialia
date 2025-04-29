from app import app  # Importando o objeto app do arquivo app.py
from flask import render_template, jsonify  # Importando render_template e jsonify
from mqtt.mqtt_handler import mqtt_data  # Importando mqtt_data
import sqlite3  # Importando sqlite3

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
    cursor.execute("SELECT timestamp, temperature FROM temperature_data ORDER BY timestamp ASC")
    rows = cursor.fetchall()
    conn.close()

    # Formatar os dados para o gráfico
    data = {
        "timestamps": [row[0] for row in rows],
        "temperatures": [row[1] for row in rows]
    }
    return jsonify(data)

