import os
import time
import random
import subprocess
import json
from datetime import datetime

# Caminho para o executável mosquitto_pub
MOSQUITTO_PUB_PATH = r'C:\Program Files\mosquitto\mosquitto_pub.exe'

# Configurações do broker MQTT
BROKER_HOST = "localhost"
TOPIC_DADOS = "essencialia/dados"
TOPIC_ALERTAS = "essencialia/alertas"

# Histórico para detecção de condições
historico = {
    "temperatura": [],
    "pressao": [],
    "ultimo_alerta": {
        "temperatura": None,
        "pressao": None,
        "nivel": None
    }
}

def gerar_dados_ficticios():
    """Gera dados fictícios para enviar ao broker."""
    temperatura = round(random.uniform(20.0, 50), 1)  # Temperatura entre 20.0 e 50.0
    nivel = random.choice(["BAIXO", "ALTO"])  # Nível fictício
    pressao_kPa = round(random.uniform(10, 40), 1)  # Pressão entre 10.0 e 40.0
    
    # Atualizar histórico
    historico["temperatura"].append(temperatura)
    historico["pressao"].append(pressao_kPa)
    
    # Manter apenas os últimos 10 valores
    if len(historico["temperatura"]) > 10:
        historico["temperatura"].pop(0)
    if len(historico["pressao"]) > 10:
        historico["pressao"].pop(0)
    
    return {
        "temperatura": temperatura,
        "nivel": nivel,
        "pressao_kPa": pressao_kPa
    }

def verificar_alertas(dados):
    """Verifica condições para gerar alertas."""
    alertas = []
    agora = datetime.now()
    
    # Verificar temperatura estagnada (mesmo valor por 30 segundos)
    if len(historico["temperatura"]) >= 3:
        if all(t == historico["temperatura"][-1] for t in historico["temperatura"][-3:]):
            ultimo_alerta_temp = historico["ultimo_alerta"]["temperatura"]
            if not ultimo_alerta_temp or (agora - ultimo_alerta_temp).total_seconds() > 30:
                alerta = {
                    "type": "temperature",
                    "message": f"Temperatura estagnada em {dados['temperatura']}°C por mais de 30 segundos",
                    "data": {
                        "temperatura": dados["temperatura"],
                        "timestamp": agora.isoformat()
                    }
                }
                alertas.append(json.dumps(alerta))
                historico["ultimo_alerta"]["temperatura"] = agora
    
    # Verificar pressão instável (variação maior que 5 kPa em 10 segundos)
    if len(historico["pressao"]) >= 2:
        variacao = abs(historico["pressao"][-1] - historico["pressao"][-2])
        if variacao > 5:
            ultimo_alerta_pressao = historico["ultimo_alerta"]["pressao"]
            if not ultimo_alerta_pressao or (agora - ultimo_alerta_pressao).total_seconds() > 10:
                alerta = {
                    "type": "pressure",
                    "message": f"Variação brusca de pressão detectada: {variacao:.1f} kPa",
                    "data": {
                        "pressao_atual": dados["pressao_kPa"],
                        "pressao_anterior": historico["pressao"][-2],
                        "variacao": variacao,
                        "timestamp": agora.isoformat()
                    }
                }
                alertas.append(json.dumps(alerta))
                historico["ultimo_alerta"]["pressao"] = agora
    
    # Verificar nível baixo
    if dados["nivel"] == "BAIXO":
        ultimo_alerta_nivel = historico["ultimo_alerta"]["nivel"]
        if not ultimo_alerta_nivel or (agora - ultimo_alerta_nivel).total_seconds() > 60:
            alerta = {
                "type": "water_level",
                "message": "Nível de água baixo detectado",
                "data": {
                    "nivel": dados["nivel"],
                    "timestamp": agora.isoformat()
                }
            }
            alertas.append(json.dumps(alerta))
            historico["ultimo_alerta"]["nivel"] = agora
    
    # Verificar temperatura crítica
    if dados["temperatura"] > 45:
        ultimo_alerta_temp = historico["ultimo_alerta"]["temperatura"]
        if not ultimo_alerta_temp or (agora - ultimo_alerta_temp).total_seconds() > 30:
            alerta = {
                "type": "temperature",
                "message": f"Temperatura crítica: {dados['temperatura']:.1f}°C",
                "data": {
                    "temperatura": dados["temperatura"],
                    "limite": 45,
                    "timestamp": agora.isoformat()
                }
            }
            alertas.append(json.dumps(alerta))
            historico["ultimo_alerta"]["temperatura"] = agora
    
    # Verificar pressão crítica
    if dados["pressao_kPa"] > 35:
        ultimo_alerta_pressao = historico["ultimo_alerta"]["pressao"]
        if not ultimo_alerta_pressao or (agora - ultimo_alerta_pressao).total_seconds() > 30:
            alerta = {
                "type": "pressure",
                "message": f"Pressão crítica: {dados['pressao_kPa']:.1f} kPa",
                "data": {
                    "pressao": dados["pressao_kPa"],
                    "limite": 35,
                    "timestamp": agora.isoformat()
                }
            }
            alertas.append(json.dumps(alerta))
            historico["ultimo_alerta"]["pressao"] = agora
    
    return alertas

def enviar_mensagem_mqtt(topic, mensagem):
    """Envia uma mensagem para o broker MQTT."""
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

def enviar_dados():
    """Envia dados fictícios e alertas para o broker MQTT."""
    while True:
        # Gerar e enviar dados
        dados = gerar_dados_ficticios()
        mensagem_dados = json.dumps(dados)
        enviar_mensagem_mqtt(TOPIC_DADOS, mensagem_dados)
        
        # Verificar e enviar alertas
        alertas = verificar_alertas(dados)
        for alerta in alertas:
            enviar_mensagem_mqtt(TOPIC_ALERTAS, alerta)
        
        # Aguarda 2 segundos antes de enviar novamente
        time.sleep(2)

if __name__ == "__main__":
    print("Iniciando simulador de dados e alertas...")
    print("Pressione Ctrl+C para encerrar")
    try:
        enviar_dados()
    except KeyboardInterrupt:
        print("\nSimulador encerrado pelo usuário")