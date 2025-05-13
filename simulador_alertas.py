import time
import random
import json
import subprocess
from datetime import datetime, timedelta, timezone

# Caminho para o executável mosquitto_pub
MOSQUITTO_PUB_PATH = r'C:\Program Files\mosquitto\mosquitto_pub.exe'

BROKER_HOST = "localhost"
TOPICO_ALERTAS = "essencialia/alertas"
TOPICO_FALHAS = "essencialia/falhas"

manaus_tz = timezone(timedelta(hours=-4))

def enviar_mensagem_mqtt(topic, mensagem):
    comando = [
        MOSQUITTO_PUB_PATH,
        "-h", BROKER_HOST,
        "-t", topic,
        "-m", mensagem
    ]
    try:
        subprocess.run(comando, check=True)
        print(f"Mensagem enviada para {topic}: {mensagem}")
    except subprocess.CalledProcessError as e:
        print(f"Erro ao enviar mensagem para {topic}: {e}")

def simular_alerta():
    alertas_texto = [
        "A temperatura nao variou em 10 minutos. Verifique o fogao.",
        "A pressao esta muito instavel. Cesse a extracao.",
        "Mudanca no nivel da agua detectada por mais de 10s!"
    ]
    return random.choice(alertas_texto)

def simular_falha():
    falhas = [
        {
            "tipo": "Temperatura estagnada",
            "horario": datetime.now(manaus_tz).isoformat(),
            "duracao_sec": random.randint(600, 1200),
            "solucao": "Temperatura voltou a variar"
        },
        {
            "tipo": "Pressao instavel",
            "horario": datetime.now(manaus_tz).isoformat(),
            "duracao_sec": random.randint(10, 60),
            "solucao": "Pressao estabilizou"
        },
        {
            "tipo": "Nivel baixo",
            "horario": datetime.now(manaus_tz).isoformat(),
            "duracao_sec": random.randint(10, 60),
            "solucao": "Nivel voltou ao normal"
        }
    ]
    return json.dumps(random.choice(falhas))

if __name__ == "__main__":
    print("Simulador de alertas/falhas MQTT iniciado. Pressione Ctrl+C para sair.")
    try:
        while True:
            # Aleatoriamente envia alerta ou falha
            if random.random() < 0.5:
                alerta = simular_alerta()
                enviar_mensagem_mqtt(TOPICO_ALERTAS, alerta)
            else:
                falha = simular_falha()
                enviar_mensagem_mqtt(TOPICO_FALHAS, falha)
            time.sleep(random.uniform(5, 15))
    except KeyboardInterrupt:
        print("Simulador encerrado.")