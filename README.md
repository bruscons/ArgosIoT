# Inteli - Instituto de Tecnologia e Liderança 

<p align="center">
<a href= "https://www.inteli.edu.br/"><img src="/assets/images/inteli.png" alt="Inteli - Instituto de Tecnologia e Liderança" border="0" width=40% height=40%></a>
</p>

<br>

# Argos

## IoTrain

## 👨‍🎓 Integrantes: 
<div align="center">
  <table>
    <tr>
      <td align="center">
        <a href="https://www.linkedin.com/in/bruno-martins-2b6742269/">
          <img src="/assets/images/membros-grupo/bruno-martins.jpg" style="border-radius: 10%; width: 150px;" alt="Bruno Martins"/><br>
          <sub><b>Bruno Martins</b></sub>
        </a>
      </td>
      <td align="center">
        <a href="https://www.linkedin.com/in/guilherme-valenca/">
          <img src="/assets/images/membros-grupo/guilherme-valenca.jpeg" style="border-radius: 10%; width: 150px;" alt="Guilherme Valenca"/><br>
          <sub><b>Guilherme Valença</b></sub>
        </a>
      </td>
      <td align="center">
        <a href="https://www.linkedin.com/in/isaac-souza-santos/">
          <img src="/assets/images/membros-grupo/isaac-souza.jpg" style="border-radius: 10%; width: 150px;" alt="Isaac Santos"/><br>
          <sub><b>Isaac Souza</b></sub>
        </a>
      </td>
      <td align="center">
        <a href="https://www.linkedin.com/in/jaime-andrade-de-almeida-0777ba2a5/">
          <img src="/assets/images/membros-grupo/jaime-almeida.png" style="border-radius: 10%; width: 150px;" alt="Jaime Almeida"/><br>
          <sub><b>Jaime Almeida</b></sub>
        </a>
      </td>
    </tr>
    <tr>
      <td align="center">
        <a href="https://www.linkedin.com/in/richarddalves/">
          <img src="/assets/images/membros-grupo/richard-alves.png" style="border-radius: 10%; width: 150px;" alt="Richard Alves"/><br>
          <sub><b>Richard Alves</b></sub>
        </a>
      </td>
      <td align="center">
        <a href="https://www.linkedin.com/in/victor-garcia-dos-santos/">
          <img src="/assets/images/membros-grupo/victor-cripto.jpg" style="border-radius: 10%; width: 150px;" alt="Victor Garcia"/><br>
          <sub><b>Victor Garcia</b></sub>
        </a>
      </td>
      <td align="center">
        <a href="https://www.linkedin.com/in/victorgrycajuk/">
          <img src="/assets/images/membros-grupo/victor-grycajuk.jpeg" style="border-radius: 10%; width: 150px;" alt="Victor Grycajuk"/><br>
          <sub><b>Victor Grycajuk</b></sub>
        </a>
      </td>
    </tr>
  </table>
</div>



## 👩‍🏫 Professores:
### Orientador(a) 
- [Fabiana Martins](https://www.linkedin.com/in/fabiana-martins-de-oliveira-8993b0b2/)
### Instrutores
- Computação: [Bryan Ferreira](https://www.linkedin.com/in/bryan-kano/)
- Design: [Guilherme Cestari](https://www.linkedin.com/in/gui-cestari/)
- Liderança: [Laíza Ribeiro](https://www.linkedin.com/in/laizaribeiro/)
- Matemática / Física: [Fernando Pizzo](https://www.linkedin.com/in/fernando-pizzo-208b526a/)
- Negócios: [Pedro Teberga](https://www.linkedin.com/in/pedroteberga/)

## 📜 Descrição

O presente projeto consiste no desenvolvimento de um sistema de autenticação e controle de acesso voltado para salas restritas localizadas em ambientes operacionais da TIC Trens, com o objetivo de aumentar a segurança, rastreabilidade e confiabilidade no acesso a áreas sensíveis da infraestrutura ferroviária. A solução foi concebida a partir da integração entre hardware embarcado, sistemas de autenticação e plataformas de monitoramento digital, buscando alinhar-se às exigências de controle operacional e segurança institucional.

No nível físico, o sistema utiliza um microcontrolador ESP32 como unidade central de processamento, responsável por gerenciar os dispositivos de entrada, saída e comunicação. O mecanismo principal de autenticação baseia-se na utilização de cartões RFID, permitindo a identificação rápida e sem contato dos usuários autorizados. Para reforçar a segurança, o sistema também incorpora um método de autenticação por senha, inserida por meio de um teclado matricial, configurando um modelo de autenticação multifatorial. O feedback ao usuário ocorre por meio de um display LCD, além de sinais visuais e sonoros emitidos por um LED RGB e um buzzer, que indicam estados como acesso permitido, acesso negado ou erro de leitura.

Inicialmente, o sistema foi montado em um ambiente prototipado, utilizando protoboard para validação das conexões elétricas e do funcionamento dos componentes. Após essa etapa, as conexões foram soldadas e os módulos devidamente organizados e fixados em uma case física, garantindo maior robustez, segurança mecânica e adequação ao uso em campo. A montagem final priorizou a disposição correta dos componentes, a proteção das conexões e a ergonomia de uso, considerando o fluxo de interação do usuário com o dispositivo.

Além do controle físico de acesso, o projeto contempla um sistema de monitoramento digital, responsável por registrar e visualizar os eventos de autenticação. Esses registros incluem informações como tentativas de acesso, horários e status das validações. Os dados são apresentados em um dashboard interativo, que permite a análise dos acessos de forma centralizada, oferecendo suporte à tomada de decisão e à auditoria de segurança. Esse painel amplia a visibilidade do sistema, permitindo identificar padrões de uso, possíveis falhas operacionais e tentativas indevidas de acesso.

Como extensão do projeto, foi iniciada a implementação de um módulo de visão computacional, cujo objetivo seria realizar a validação visual dos acessos, associando imagens ou registros visuais aos logs gerados pelo sistema. Essa funcionalidade buscaria aumentar ainda mais a confiabilidade do controle de acesso, adicionando uma camada adicional de verificação. No entanto, devido a limitações de tempo e integração, essa etapa não pôde ser completamente conectada ao sistema principal, permanecendo como um desenvolvimento parcial e conceitual.

De forma geral, o projeto demonstra a viabilidade da integração entre sistemas embarcados, métodos de autenticação e plataformas de monitoramento, aplicados a um contexto real de segurança ferroviária. A solução proposta contribui para o fortalecimento do controle de acesso em ambientes críticos, ao mesmo tempo em que oferece uma base sólida para futuras expansões, como a integração completa da visão computacional e o aprimoramento das funcionalidades de análise e gestão dos dados de acesso.

[Vídeo Demonstrativo](https://www.youtube.com/watch?v=zPGXsDBjmhk)


## 📁 Estrutura de pastas

Dentre os arquivos e pastas presentes na raiz do projeto, definem-se:

- <b>assets</b>: aqui estão os arquivos relacionados a parte gráfica do projeto, ou seja, as imagens e vídeos que os representam (O logo do grupo pode ser adicionado nesta pasta).

- <b>document</b>: aqui estão todos os documentos do projeto, incluindo o manual de instruções (se aplicável). Há também uma pasta denominada <b>outros</b> onde estão presentes outros documentos complementares.

- <b>src</b>: Todo o código fonte criado para o desenvolvimento do projeto, incluindo firmware, notebooks, backend e frontend, se aplicáveis.

- <b>README.md</b>: arquivo que serve como guia e explicação geral sobre o projeto (o mesmo que você está lendo agora).

## 🔧 Instalação

Para a correta execução e testes do projeto, é necessário que o ambiente de desenvolvimento esteja devidamente configurado, contemplando tanto o sistema embarcado quanto as camadas de software da solução.

Como pré-requisitos, são utilizados os seguintes ambientes e ferramentas:

- **Arduino IDE**, para desenvolvimento, compilação e gravação do firmware no ESP32, bem como a instalação das bibliotecas necessárias ao funcionamento dos módulos (RFID, LCD, teclado matricial, entre outros);
- **Visual Studio Code**, como editor de código para o desenvolvimento das camadas de backend e frontend;
- **Node.js**, utilizado para a execução do servidor backend e do frontend da aplicação, com gerenciamento de dependências por meio do **npm**.

A instalação das dependências do projeto é realizada via **npm**, executando-se o comando `npm install` nas pastas correspondentes ao **backend** e ao **frontend**, garantindo a correta instalação das bibliotecas utilizadas em cada camada. Da mesma forma, as bibliotecas necessárias ao funcionamento do firmware são instaladas diretamente pela **Arduino IDE**, conforme descrito no manual.

O procedimento completo de configuração do ambiente, incluindo:
- versões das ferramentas utilizadas,
- instalação das bibliotecas,
- configuração do ESP32,
- e execução da aplicação,

está detalhadamente descrito no **Manual de Instruções** do projeto, que deve ser consultado para a reprodução correta da solução.

## 📘 Manual de Instruções

Para replicar todo o projeto **Argos**, incluindo instalação, configuração dos dispositivos, execução do backend/frontend e integração completa do sistema, consulte o manual de instruções presente na pasta `document`.

➡️ **Acesse o Manual de Instruções:**  
[document/manual_de_instrucoes.pdf](document/Manual%20de%20Instruções%20-%20IoTrain.pdf)

## 🗃 Histórico de lançamentos

* 0.5.0 - 19/12/2025 - Documentação final e integração entre autenticação e visão computacional.
    
* 0.4.0 - 05/12/2025 - Documentação respectiva ao protótipo final, testes e fluxo de funcionamento, além de término do dashboard.
    
* 0.3.0 - 19/11/2025 - Documentação de requisitos (RF e RNF) e implementação final do protocolo MQTT.
    
* 0.2.0 - 07/11/2025 - Documentação inicial do sistema físico e substituição do HTTP e MQTT.
    
* 0.1.0 - 24/10/2025 - Documentação do protótipo offline e construção dos fundamentos do circuito via wokwi.
    

## 📋 Licença/License

<a href="https://github.com/Inteli-College/2025-2B-T18-IN02-G04.git">IoTrain</a> © 2025 by <a href="https://github.com/Inteli-College/2025-2B-T18-IN02-G04.git">INTELI, Bruno Martins, Guilherme Valença, Isaac Santos, Jaime Andrade, Richard Alves, Victor Garcia, Victor Grycajuk</a> is licensed under <a href="https://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International</a><img src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" style="max-width: 1em;max-height:1em;margin-left: .2em;"><img src="https://mirrors.creativecommons.org/presskit/icons/by.svg" style="max-width: 1em;max-height:1em;margin-left: .2em;">
