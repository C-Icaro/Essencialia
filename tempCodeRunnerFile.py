import os
import time
import random

# Caminho para o executável mosquitto_pub
MOSQUITTO_PUB_PATH = r'C:\Program Files\mosquitto\mosquitto_pub.exe'

# Configurações do broker MQTT
BROKER_HOST = "localhost"
TOPIC = "essencialia/dados"

def gerar_dados_ficticios():
    """Gera dados fictícios para enviar ao broker."""
    temperatura = round(random.uniform(20.0, 35.0), 1)  # Temperatura entre 20.0 e 35.0
    nivel = random.choice(["BAIXO", "MEDIO", "ALTO"])  # Nível fictício
    pressao_kPa = round(random.uniform(90.0, 110.0), 1)  # Pressão entre 90.0 e 110.0
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
        comando = f'"{MOSQUITTO_PUB_PATH}" -h {BROKER_HOST} -t {TOPIC} -m "{mensagem}"'
        
        # Executa o comando para enviar os dados
        os.system(comando)
        print(f"Dados enviados: {mensagem}")
        
        # Aguarda 5 segundos antes de enviar novamente
        time.sleep(5)

if __name__ == "__main__":
    enviar_dados()