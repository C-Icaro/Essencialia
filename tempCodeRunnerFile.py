from flask import Flask # Importando o framework Flask

app = Flask(__name__) # Criando uma instância do Flask

from routes import * # Importando as rotas definidas no arquivo routes.py
if __name__ == "__main__": # Verifica se o script está sendo executado diretamente
    app.run() # Executando o web server