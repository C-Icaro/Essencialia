import os
import time
import random
import json
import subprocess
from datetime import datetime

# Caminho para o executável mosquitto_pub
MOSQUITTO_PUB_PATH = r'C:\Program Files\mosquitto\mosquitto_pub.exe'

# Configurações do broker MQTT
BROKER_HOST = "localhost"
TOPIC_ALERTAS = "essencialia/alertas"

# Configurações dos alertas
TIPOS_ALERTA = {
    "temperature": {
        "mensagens": [
            "Temperatura acima do limite crítico",
            "Temperatura abaixo do limite mínimo",
            "Variação brusca de temperatura detectada",
            "Temperatura estagnada por muito tempo"
        ],
        "limites": {
            "min": 20,
            "max": 45,
            "variacao_maxima": 5
        }
    },
    "pressure": {
        "mensagens": [
            "Pressão acima do limite crítico",
            "Pressão abaixo do limite mínimo",
            "Variação brusca de pressão detectada",
            "Pressão instável detectada"
        ],
        "limites": {
            "min": 10,
            "max": 35,
            "variacao_maxima": 5
        }
    },
    "water_level": {
        "mensagens": [
            "Nível de água crítico",
            "Nível de água baixo",
            "Nível de água alto",
            "Vazamento detectado"
        ],
        "niveis": ["BAIXO", "NORMAL", "ALTO"]
    },
    "system": {
        "mensagens": [
            "Falha na comunicação com o sensor",
            "Reinicialização do sistema necessária",
            "Manutenção preventiva recomendada",
            "Backup do sistema realizado"
        ]
    }
}

def gerar_alerta_aleatorio():
    """Gera um alerta aleatório com dados simulados."""
    tipo = random.choice(list(TIPOS_ALERTA.keys()))
    config = TIPOS_ALERTA[tipo]
    
    # Selecionar mensagem aleatória
    mensagem = random.choice(config["mensagens"])
    
    # Gerar dados específicos baseado no tipo
    dados = {
        "timestamp": datetime.now().isoformat()
    }
    
    if tipo == "temperature":
        temperatura = round(random.uniform(config["limites"]["min"], config["limites"]["max"]), 1)
        dados.update({
            "temperatura": temperatura,
            "limite": config["limites"]["max"] if temperatura > config["limites"]["max"] else config["limites"]["min"]
        })
        if "variação" in mensagem.lower():
            dados["variacao"] = round(random.uniform(0, config["limites"]["variacao_maxima"]), 1)
    
    elif tipo == "pressure":
        pressao = round(random.uniform(config["limites"]["min"], config["limites"]["max"]), 1)
        dados.update({
            "pressao": pressao,
            "limite": config["limites"]["max"] if pressao > config["limites"]["max"] else config["limites"]["min"]
        })
        if "variação" in mensagem.lower():
            dados.update({
                "pressao_atual": pressao,
                "pressao_anterior": round(pressao - random.uniform(0, config["limites"]["variacao_maxima"]), 1),
                "variacao": round(random.uniform(0, config["limites"]["variacao_maxima"]), 1)
            })
    
    elif tipo == "water_level":
        dados["nivel"] = random.choice(config["niveis"])
    
    elif tipo == "system":
        dados["status"] = "CRÍTICO" if "Falha" in mensagem or "Reinicialização" in mensagem else "INFO"
    
    # Criar objeto do alerta
    alerta = {
        "type": tipo,
        "message": mensagem,
        "data": dados
    }
    
    return alerta

def enviar_alerta(alerta):
    """Envia um alerta para o broker MQTT."""
    comando = [
        MOSQUITTO_PUB_PATH,
        "-h", BROKER_HOST,
        "-t", TOPIC_ALERTAS,
        "-m", json.dumps(alerta)
    ]
    
    try:
        subprocess.run(comando, check=True)
        print(f"Alerta enviado: {alerta['message']}")
        print(f"Dados: {json.dumps(alerta['data'], indent=2)}")
    except subprocess.CalledProcessError as e:
        print(f"Erro ao enviar alerta: {e}")

def simular_alertas():
    """Simula o envio de alertas aleatórios."""
    print("Iniciando simulador de alertas...")
    print("Pressione Ctrl+C para encerrar")
    
    try:
        while True:
            # Gerar e enviar alerta aleatório
            alerta = gerar_alerta_aleatorio()
            enviar_alerta(alerta)
            
            # Aguardar entre 5 e 15 segundos antes do próximo alerta
            tempo_espera = random.uniform(5, 15)
            print(f"\nPróximo alerta em {tempo_espera:.1f} segundos...")
            time.sleep(tempo_espera)
            
    except KeyboardInterrupt:
        print("\nSimulador de alertas encerrado pelo usuário")

if __name__ == "__main__":
    simular_alertas() 