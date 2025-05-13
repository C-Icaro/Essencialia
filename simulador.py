import os
import time
import random
import subprocess

# Caminho para o executável mosquitto_pub
MOSQUITTO_PUB_PATH = r'C:\Program Files\mosquitto\mosquitto_pub.exe'

# Configurações do broker MQTT
BROKER_HOST = "localhost"
TOPIC = "essencialia/dados"

def gerar_dados_ficticios():
    """Gera dados fictícios para enviar ao broker."""
    temperatura = round(random.uniform(20.0, 50), 1)  # Temperatura entre 20.0 e 35.0
    nivel = random.choice(["BAIXO","ALTO"])  # Nível fictício
    pressao_kPa = round(random.uniform(10, 40), 1)  # Pressão entre 10.0 e 40.0
    return {
        "temperatura": temperatura,
        "nivel": nivel,
        "pressao_kPa": pressao_kPa
    }

def enviar_dados():
    """Envia dados fictícios para o broker MQTT."""
    while True:
        dados = gerar_dados_ficticios()
        mensagem = f'{{"temperatura": {dados["temperatura"]}, "nivel": "{dados["nivel"]}", "pressao_kPa": {dados["pressao_kPa"]}}}'
        
        # Comando para enviar os dados
        comando = [
            MOSQUITTO_PUB_PATH,
            "-h", BROKER_HOST,
            "-t", TOPIC,
            "-m", mensagem
        ]
        
        # Executa o comando usando subprocess.run
        try:
            subprocess.run(comando, check=True)
            print(f"Dados enviados: {mensagem}")
        except subprocess.CalledProcessError as e:
            print(f"Erro ao enviar dados: {e}")
        
        # Aguarda 10 segundos antes de enviar novamente
        time.sleep(10)

if __name__ == "__main__":
    enviar_dados()