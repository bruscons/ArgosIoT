# Visão Computacional - Sistema de Contagem Conectado (YOLOv8m)

Este diretório contém os scripts e recursos necessários para o módulo de visão computacional do projeto. O sistema utiliza o modelo oficial **YOLOv8m** (Medium) para detecção robusta de pessoas, implementando pré-processamento de imagem para ambientes com baixa luminosidade e integração via API para envio de dados em tempo real.

## Descrição do Modelo

O sistema baseia-se na arquitetura **YOLOv8 (You Only Look Once version 8)** da Ultralytics, utilizando pesos pré-treinados no dataset COCO.

* **Modelo:** Utiliza o arquivo `yolov8m.pt` (Medium). Esta versão foi escolhida por oferecer um equilíbrio superior entre precisão e inteligência em comparação à versão Nano, sendo capaz de distinguir pessoas de outros objetos com maior eficácia sem necessidade de re-treinamento.
* **Pré-processamento (CLAHE):** O script aplica *Contrast Limited Adaptive Histogram Equalization* em cada frame antes da inferência. Isso nivela a iluminação digitalmente, permitindo detecções precisas mesmo em cenários de iluminação complexa ou escassa.
* **Lógica de Contagem Híbrida:** O sistema utiliza pontos de referência distintos para maximizar a precisão nas bordas da imagem:
    * **Entrada (Linha Azul):** Baseada no **centróide** (centro do corpo).
    * **Saída (Linha Vermelha):** Baseada na **base da bounding box** (pés), garantindo a contagem antes que o indivíduo saia totalmente do quadro.
* **Conectividade:** O sistema envia requisições HTTP (POST) para um backend a cada evento de contagem, utilizando processamento em *threads* para evitar latência no vídeo.

## Estrutura Esperada das Pastas

```
src/
└── visao-computacional/
    ├── README.md
    ├── .gitignore.md
    ├── modelo_final.py
    ├── yolov8m.pt
```

## Como Baixar Pesos Pré-treinados (`yolov8m.pt`)

O sistema foi desenvolvido para operar com o modelo oficial, dispensando datasets externos.

**Método Automático:**
Ao executar o script pela primeira vez, a biblioteca `ultralytics` detectará a ausência do modelo e realizará o download do `yolov8m.pt` automaticamente.

**Método Manual:**
Caso prefira baixar manualmente ou o download automático falhe:
[Download yolov8m.pt (Github Releases)](https://github.com/ultralytics/assets/releases/download/v8.2.0/yolov8m.pt)

Coloque o arquivo baixado na raiz deste diretório.

## Instruções de Configuração e Uso

Ao iniciar o script, o sistema entrará em modo de calibração visual:

1.  **Definição de Linhas Virtuais:**
    * **1º Clique:** Define a altura da **Linha Azul** (Entrada/Topo).
    * **2º Clique:** Define a altura da **Linha Vermelha** (Saída/Baixo).
2.  **Início da Operação:** Pressione `ESPAÇO` para confirmar a geometria e iniciar o monitoramento.
3.  **Integração API:** Verifique a variável `URL_API` no código para apontar para o endpoint correto do seu backend (ex: `http://localhost:3000/api/room-occupancy`).


## Lógica de Funcionamento Detalhada

O sistema opera em um ciclo contínuo de captura, inferência e análise geométrica. A estabilidade da contagem é garantida por uma abordagem híbrida de rastreamento:

1.  **Pré-processamento (Visão Noturna Digital):**
    * Cada frame capturado passa por um filtro **CLAHE** (Contrast Limited Adaptive Histogram Equalization). A imagem é convertida para o espaço de cor LAB, onde a luminosidade é equalizada para destacar contornos em ambientes escuros, e depois reconvertida para BGR.

2.  **Rastreamento (Tracking):**
    * O modelo **YOLOv8m** detecta objetos da classe `0` (Pessoa).
    * O algoritmo **ByteTrack** gerencia a persistência dos IDs, garantindo que uma pessoa mantenha o mesmo número identificador mesmo se houver falhas momentâneas na detecção ou oclusão parcial.

3.  **Geometria de Contagem Híbrida:**
    Diferente de sistemas tradicionais que usam apenas o centro do objeto, este projeto utiliza pontos de referência dinâmicos para corrigir erros de perspectiva na saída:
    
    * **Entrada (Linha Azul):** Monitora o **Centróide** (Centro geométrico da caixa).
        * *Gatilho:* O centro cruza a linha de cima para baixo com velocidade negativa validada.
    
    * **Saída (Linha Vermelha):** Monitora a **Base** (Coordenada Y inferior / Pés).
        * *Motivo:* Em ângulos de câmera superiores, os pés cruzam a linha de saída antes que o corpo desapareça do quadro.
        * *Gatilho:* A base cruza a linha vermelha, com uma trava lógica que ignora movimentos de subida (reentrada) para evitar falsos positivos.

4.  **Comunicação Assíncrona (Non-blocking):**
    * Ao validar uma contagem, o script dispara uma *Thread* isolada para enviar o payload JSON ao backend. Isso isola o processo de I/O (rede), impedindo que oscilações na internet congelem o processamento de vídeo.

## Requisitos e Dependências

O projeto requer Python 3.8+ e as seguintes bibliotecas. A biblioteca `requests` foi adicionada para a comunicação com o servidor.

Principais Dependências:

-   **ultralytics** (Core do YOLO e Tracking ByteTrack)
-   **opencv-python** (Processamento de vídeo e CLAHE)
-   **numpy** (Cálculos matemáticos)
-   **requests** (Envio de dados HTTP)

Comando de Instalação:

```bash
pip install ultralytics opencv-python numpy requests
