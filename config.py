BROKER_HOST = "localhost"  # IP do broker
BROKER_PORT = 1883

# Para testar com publicações locais:
# CMD: "C:\Program Files\mosquitto\mosquitto_pub.exe" -h localhost -t essencialia/dados -m "{\"temperatura\": 29.5, \"nivel\": \"ALTO\", \"pressao_kPa\": 101.3}"
# PowerShell: & "C:\Program Files\mosquitto\mosquitto_pub.exe" -h localhost -t essencialia/dados -m '{"temperatura": 25.5, "nivel": "ALTO", "pressao_kPa": 101.3}'