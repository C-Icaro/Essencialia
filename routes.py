from app import app # Importando o objeto app do arquivo app.py
from flask import render_template # Importando a função render_template do Flask para renderizar templates HTML

# Definindo rotas do web server

@app.route("/") # Rota para a Home Page
def homepage(): # Fundação que será chamada quando a rota for acessada
    return render_template("homepage.html")

@app.route("/dashboard") # Rota para a Home Page
def dashboard():
    return render_template("dashboard.html")

