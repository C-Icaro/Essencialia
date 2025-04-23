import paho.mqtt.client as mqtt

# Variáveis globais para armazenar os dados recebidos
mqtt_data = {
    "nome_planta": "Batata",
    "temperatura": "25",
    "nivel_agua": "Alto",
    "pressao": "Carregando..."
}

def on_connect(client, userdata, flags, rc):
    print("Conectado ao broker MQTT")
    client.subscribe("planta/nome")
    client.subscribe("planta/temperatura")
    client.subscribe("planta/nivel_agua")
    client.subscribe("planta/pressao")

def on_message(client, userdata, msg):
    global mqtt_data
    if msg.topic == "planta/nome":
        mqtt_data["nome_planta"] = msg.payload.decode()
    elif msg.topic == "planta/temperatura":
        mqtt_data["temperatura"] = msg.payload.decode()
    elif msg.topic == "planta/nivel_agua":
        mqtt_data["nivel_agua"] = msg.payload.decode()
    elif msg.topic == "planta/pressao":
        mqtt_data["pressao"] = msg.payload.decode()

def start_mqtt(broker_host, broker_port):
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(broker_host, broker_port, 60)
    client.loop_start()
    return client