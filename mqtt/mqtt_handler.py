import paho.mqtt.client as mqtt
import json

# Variáveis globais para armazenar os dados recebidos
mqtt_data = {
    "temperatura": "80...",
    "nivel": "94...",
    "pressao_kPa": "10000..."
}

def on_connect(client, userdata, flags, rc):
    print("Conectado ao broker MQTT")
    # Inscreve-se no tópico onde a ESP32 publica os dados
    client.subscribe("essencialia/dados")

def on_message(client, userdata, msg):
    global mqtt_data
    try:
        # Decodifica a mensagem JSON recebida
        payload = json.loads(msg.payload.decode())
        mqtt_data["temperatura"] = f"{payload.get('temperatura', 'N/A')} °C"
        mqtt_data["nivel"] = payload.get("nivel", "N/A")
        mqtt_data["pressao_kPa"] = f"{payload.get('pressao_kPa', 'N/A')} kPa"
        print(f"Dados atualizados: {mqtt_data}")
    except json.JSONDecodeError:
        print("Erro ao decodificar a mensagem MQTT")

def start_mqtt(broker_host, broker_port):
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(broker_host, broker_port, 60)
    client.loop_start()
    return client