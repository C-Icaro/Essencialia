from app import app  # Importando o objeto app do arquivo app.py
from flask import render_template, jsonify  # Importando render_template e jsonify
from mqtt.mqtt_handler import mqtt_data  # Importando mqtt_data

# Definindo rotas do web server

@app.route("/")  # Rota para a Home Page
def introducao():  # Função que será chamada quando a rota for acessada
    return render_template("introducao01.html")

@app.route("/homepage")  # Rota para a Home Page
def homepage():
    return render_template("homepage.html")

@app.route("/dashboard")  # Rota para o Dashboard
def dashboard():
    return render_template("dashboard.html")

@app.route("/mqtt-data")
def get_mqtt_data():
    return jsonify(mqtt_data)

