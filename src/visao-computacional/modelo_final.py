import cv2
from ultralytics import YOLO
import time
import sys
import numpy as np
import requests
import threading

# Define câmera escolhida para utilização do script.
INDICE_CAMERA = 0

# Backend de vídeo: No Mac usamos AVFOUNDATION para ser rápido.
# Se for Windows, o Python troca sozinho.
BACKEND_CAMERA = cv2.CAP_AVFOUNDATION 

# O cérebro da IA. Usamos o modelo 'Medium' (m) porque ele é mais esperto que o 'Nano',
MODELO_PATH = 'yolov8m.pt' 

# Onde guardamos o histórico local caso a internet caia.
ARQUIVO_CONTAGEM = "contagem.txt"

# Sensibilidade de movimento. Se a pessoa andar muito devagar, ainda conta. 
MIN_VELOCIDADE_Y = 1 

# O endereço do seu sistema (backend). É para cá que mandamos a fofoca de quem entrou.
URL_API = "http://localhost:3000/api/room-occupancy"

# Variáveis globais 
linha_azul_y = None       # Linha de ENTRADA (Cima)
linha_vermelha_y = None   # Linha de SAÍDA (Baixo)
configurando = True       # Checagem da fase de monitoramento

# O CLAHE é um algoritmo que "acende a luz" digitalmente.
# Ele nivela o contraste para a IA enxergar pessoas mesmo no escuro.
clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))

def preprocessar_imagem(frame):
    lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    l2 = clahe.apply(l)
    lab = cv2.merge((l2, a, b))
    frame_melhorado = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
    return frame_melhorado

def desenhar_linhas(event, x, y, flags, param):
    global linha_azul_y, linha_vermelha_y
    if event == cv2.EVENT_LBUTTONDOWN:
        if linha_azul_y is None:
            linha_azul_y = y
        elif linha_vermelha_y is None:
            linha_vermelha_y = y

def enviar_request(contagem_atual):

    #Esta função faz o trabalho sujo de conectar na internet e mandar os dados.
    #Se a internet cair ou o servidor demorar, o 'try/except' garante que
    #o programa não trave e continue filmando.

    try:
        payload = {
            "room_id": "SALA_01",       # Qual sala
            "current_count": contagem_atual,
            "camera_id": "CAM_001"      # Qual câmera 
        }
        requests.post(URL_API, json=payload)
    except:
        pass

def notificar_backend(contagem_atual):
    thread = threading.Thread(target=enviar_request, args=(contagem_atual,))
    thread.start()

def salvar_contagem(c):
    #Salva num arquivinho de texto local, só por segurança (backup).
    try:
        with open(ARQUIVO_CONTAGEM, "w") as f: f.write(str(c))
    except: pass

print(f"Acordando a Inteligência Artificial ({MODELO_PATH})...")
try:
    model = YOLO(MODELO_PATH)
except Exception as e:
    print(f"Erro fatal: A IA não acordou. Verifique se baixou o arquivo .pt. Erro: {e}")
    sys.exit()

# Ligando a câmera
cap = cv2.VideoCapture(INDICE_CAMERA, BACKEND_CAMERA)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
cap.set(cv2.CAP_PROP_FPS, 30)
time.sleep(1.0) # Espera 1 segundinho para a lente da câmera ajustar a luz

NOME_JANELA = "Configuracao"
cv2.namedWindow(NOME_JANELA)
cv2.setMouseCallback(NOME_JANELA, desenhar_linhas)

print("\n--- HORA DE DESENHAR ---")
print("1. Clique onde a pessoa ENTRA (Linha Azul - Topo)")
print("2. Clique onde a pessoa SAI (Linha Vermelha - Baixo)")
print("3. Aperte ESPAÇO quando terminar.")

while configurando:
    ret, frame = cap.read()
    if not ret: break
    frame = preprocessar_imagem(frame) # Já mostra a imagem clareada para ajudar

    # Desenha as linhas na tela para você ver onde clicou
    if linha_azul_y is None:
        cv2.putText(frame, "CLIQUE: LINHA AZUL (CIMA)", (30, 50), 1, 2, (255, 255, 0), 2)
    elif linha_vermelha_y is None:
        cv2.line(frame, (0, linha_azul_y), (640, linha_azul_y), (255, 0, 0), 2)
        cv2.putText(frame, "CLIQUE: LINHA VERMELHA (BAIXO)", (30, 50), 1, 2, (0, 0, 255), 2)
    else:
        cv2.line(frame, (0, linha_azul_y), (640, linha_azul_y), (255, 0, 0), 2)
        cv2.line(frame, (0, linha_vermelha_y), (640, linha_vermelha_y), (0, 0, 255), 2)
        cv2.putText(frame, "PRONTO! APERTE ESPACO", (30, 100), 1, 2, (0, 255, 0), 2)

    cv2.imshow(NOME_JANELA, frame)
    # Se apertar ESPAÇO e as linhas existirem, sai do loop
    if cv2.waitKey(1) & 0xFF == ord(' ') and linha_azul_y and linha_vermelha_y:
        configurando = False
cv2.destroyWindow(NOME_JANELA)

contagem = 0
historico_track = {} # Memória de onde cada pessoa estava no frame anterior
estado_ids = {}      # Lista VIP: quem já foi contado para não contar duas vezes

NOME_JANELA_MAIN = "Monitoramento Conectado"
cv2.namedWindow(NOME_JANELA_MAIN)

print("\nIniciando sistema...")

while True:
    ret, frame = cap.read()
    if not ret: break

    # Melhora a imagem (visão noturna digital)
    frame_processado = preprocessar_imagem(frame)

    # conf=0.10: Deixamos ela bem "liberal". Mesmo se ela tiver dúvida, ela mostra.
    # classes=[0]: Só queremos PESSOAS (ID 0). Ignora mochilas e cachorros.
    # tracker: Usa o ByteTrack para manter o ID da pessoa mesmo se ela piscar.
    results = model.track(frame_processado, persist=True, verbose=False, conf=0.10, classes=[0], tracker="bytetrack.yaml")

    if results[0].boxes.id is not None:
        # Pega as coordenadas e os IDs de quem a IA achou
        boxes = results[0].boxes.xyxy.cpu().numpy()
        ids = results[0].boxes.id.cpu().numpy().astype(int)

        # Limpeza de memória: se tiver muita gente velha na lista, limpa.
        if len(estado_ids) > 1000: estado_ids.clear()

        for box, track_id in zip(boxes, ids):
            x1, y1, x2, y2 = map(int, box)
            
            # Centro: Bom para saber onde o corpo está.
            centro_x = int((x1 + x2) / 2)
            centro_y = int((y1 + y2) / 2)
            
            # Base (Pés): O segredo da saída
            # Usamos os pés porque eles cruzam a linha de saída antes do corpo sumir da câmera.
            base_y = int(y2)

            # Desenhos na tela (Debug visual)
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.circle(frame, (centro_x, centro_y), 4, (0, 255, 0), -1) # Ponto Verde (Corpo)
            cv2.circle(frame, (centro_x, base_y), 4, (0, 0, 255), -1)   # Ponto Vermelho (Pés)

            # Se é a primeira vez que vemos essa pessoa, só salva a posição e pula
            if track_id not in historico_track:
                historico_track[track_id] = centro_y
                continue
            
            # Onde ela estava antes
            y_anterior_centro = historico_track[track_id]
            
            # Diferença de posição
            dy = centro_y - y_anterior_centro 

            # Usamos o CENTRO do corpo.
            # Se estava acima da linha azul E agora está abaixo, entrou
            if (y_anterior_centro > linha_azul_y and centro_y <= linha_azul_y) and (dy < -MIN_VELOCIDADE_Y):
                if estado_ids.get(track_id) != 'DENTRO':
                    contagem += 1
                    salvar_contagem(contagem)
                    notificar_backend(contagem) 
                    estado_ids[track_id] = 'DENTRO' # Marca como contado
                    print(f"[+] ID {track_id} ENTROU")
                    # Pisca a linha de verde
                    cv2.line(frame, (0, linha_azul_y), (640, linha_azul_y), (0, 255, 0), 5)

            # Usamos os PÉS (BASE).
            # Se o corpo estava na zona segura, mas os PÉS cruzaram a linha vermelha, SAIU.
            elif (y_anterior_centro < linha_vermelha_y and base_y >= linha_vermelha_y) and (dy > -MIN_VELOCIDADE_Y):
                # A checagem 'dy > -MIN' evita contar quem está entrando e pisa na linha vermelha sem querer.
                if estado_ids.get(track_id) != 'FORA':
                    contagem = max(0, contagem - 1) # Nunca deixa contagem negativa
                    salvar_contagem(contagem)
                    notificar_backend(contagem) # Avisa o servidor
                    estado_ids[track_id] = 'FORA'
                    print(f"[-] ID {track_id} SAIU")
                    # Pisca a linha de vermelho
                    cv2.line(frame, (0, linha_vermelha_y), (640, linha_vermelha_y), (0, 0, 255), 5)

            # Atualiza a posição para o próximo frame
            historico_track[track_id] = centro_y

    # Desenha as linhas fixas e o placar
    cv2.line(frame, (0, linha_azul_y), (640, linha_azul_y), (255, 0, 0), 2)
    cv2.line(frame, (0, linha_vermelha_y), (640, linha_vermelha_y), (0, 0, 255), 2)
    cv2.putText(frame, f"Total: {contagem}", (10, 35), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
    
    cv2.imshow(NOME_JANELA_MAIN, frame)
    # Se apertar 'q', encerra a janela.
    if cv2.waitKey(1) & 0xFF == ord('q'): break

cap.release()
cv2.destroyAllWindows()