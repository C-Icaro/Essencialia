BROKER_HOST = "localhost"  # IP do broker
BROKER_PORT = 1883

# Para testar com publicações locais:
# CMD: "C:\Program Files\mosquitto\mosquitto_pub.exe" -h localhost -t essencialia/dados -m "{\"temperatura\": 29.5, \"nivel\": \"ALTO\", \"pressao_kPa\": 101.3}"
# PowerShell: & "C:\Program Files\mosquitto\mosquitto_pub.exe" -h localhost -t essencialia/dados -m '{"temperatura": 25.5, "nivel": "ALTO", "pressao_kPa": 101.3}'

# & "C:\Program Files\mosquitto\mosquitto_pub.exe" mosquitto_pub -h 127.0.0.1 -t essencialia/alertas -m '{"type":"temperature","message":"Teste de alerta manual","data":{"temperatura":99,"limite":45,"timestamp":"2025-05-12T22:00:00"}}'