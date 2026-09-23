# Inteli - Instituto de Tecnologia e Liderança 

<p align="center">
<a href= "https://www.inteli.edu.br/"><img src="/assets/images/inteli.png" alt="Inteli - Instituto de Tecnologia e Liderança" border="0" width=40% height=40%></a>
</p>

<br>

# Argos

## IoTrain

## 👨‍🎓 Team Members: 
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



## 👩‍🏫 Professors:
### Advisor 
- [Fabiana Martins](https://www.linkedin.com/in/fabiana-martins-de-oliveira-8993b0b2/)
### Instructors
- Computer Science: [Bryan Ferreira](https://www.linkedin.com/in/bryan-kano/)
- Design: [Guilherme Cestari](https://www.linkedin.com/in/gui-cestari/)
- Leadership: [Laíza Ribeiro](https://www.linkedin.com/in/laizaribeiro/)
- Math / Physics: [Fernando Pizzo](https://www.linkedin.com/in/fernando-pizzo-208b526a/)
- Business: [Pedro Teberga](https://www.linkedin.com/in/pedroteberga/)

## 📜 Description

This project consists of the development of an authentication and access control system designed for restricted rooms located in TIC Trens' operational environments, with the goal of increasing security, traceability, and reliability of access to sensitive areas of the railway infrastructure. The solution was conceived by integrating embedded hardware, authentication systems, and digital monitoring platforms, aiming to align with operational control and institutional security requirements.

At the physical level, the system uses an ESP32 microcontroller as the central processing unit, responsible for managing input, output, and communication devices. The primary authentication mechanism is based on RFID cards, enabling fast, contactless identification of authorized users. To reinforce security, the system also incorporates password authentication entered via a matrix keypad, forming a multi-factor authentication model. User feedback is provided through an LCD display, along with visual and audio signals from an RGB LED and a buzzer, indicating states such as access granted, access denied, or read error.

Initially, the system was assembled in a prototype environment using a breadboard to validate the electrical connections and component functionality. After this stage, the connections were soldered and the modules properly organized and mounted in a physical case, ensuring greater robustness, mechanical safety, and suitability for field use. The final assembly prioritized correct component placement, connection protection, and usage ergonomics, taking into account the user's interaction flow with the device.

In addition to physical access control, the project includes a digital monitoring system responsible for logging and displaying authentication events. These records include information such as access attempts, timestamps, and validation status. The data is presented on an interactive dashboard that enables centralized analysis of access events, supporting decision-making and security audits. This panel expands system visibility, making it possible to identify usage patterns, potential operational failures, and unauthorized access attempts.

As an extension of the project, implementation began on a computer vision module intended to perform visual validation of access events, associating images or visual records with the logs generated by the system. This feature aimed to further increase the reliability of access control by adding an extra verification layer. However, due to time and integration constraints, this stage could not be fully connected to the main system and remains a partial, conceptual development.

Overall, the project demonstrates the feasibility of integrating embedded systems, authentication methods, and monitoring platforms, applied to a real-world railway security context. The proposed solution strengthens access control in critical environments, while providing a solid foundation for future expansion, such as the full integration of computer vision and enhanced access data analysis and management features.

[Demo Video](https://www.youtube.com/watch?v=zPGXsDBjmhk)

## 📰 Media Coverage

This project was developed as part of a broader partnership between Inteli and TIC Trens, the concessionaire that operates São Paulo's Line 7-Rubi, aimed at building AI and IoT solutions for railway operational security. The partnership was covered by Exame magazine:

[Trem de São Paulo vira laboratório de IA em parceria da TIC Trens e Inteli](https://exame.com/tecnologia/trem-de-sao-paulo-vira-laboratorio-de-ia-em-parceria-da-tic-trens-e-inteli/) (Exame, December 2025)

## 📁 Folder Structure

Among the files and folders present in the project root, we define:

- <b>assets</b>: contains files related to the graphical part of the project, i.e., the images and videos that represent it (the group logo can be added to this folder).

- <b>document</b>: contains all project documents, including the instruction manual (if applicable). There is also a folder called <b>outros</b> (others) containing supplementary documents.

- <b>src</b>: all source code created for the project's development, including firmware, notebooks, backend, and frontend, as applicable.

- <b>README.md</b>: file that serves as a guide and general explanation of the project (the one you are reading now).

## 🔧 Installation

For the correct execution and testing of the project, the development environment must be properly set up, covering both the embedded system and the software layers of the solution.

The following environments and tools are used as prerequisites:

- **Arduino IDE**, for developing, compiling, and flashing firmware to the ESP32, as well as installing the libraries required for the modules (RFID, LCD, matrix keypad, among others);
- **Visual Studio Code**, as the code editor for backend and frontend development;
- **Node.js**, used to run the application's backend server and frontend, with dependency management via **npm**.

Project dependencies are installed via **npm**, by running the `npm install` command in the corresponding **backend** and **frontend** folders, ensuring the correct installation of the libraries used in each layer. Likewise, the libraries required for the firmware are installed directly via the **Arduino IDE**, as described in the manual.

The complete environment setup procedure, including:
- tool versions used,
- library installation,
- ESP32 configuration,
- and running the application,

is described in detail in the project's **Instruction Manual**, which should be consulted to correctly reproduce the solution.

## 📘 Instruction Manual

To replicate the entire **Argos** project, including installation, device configuration, running the backend/frontend, and full system integration, refer to the instruction manual in the `document` folder.

➡️ **Access the Instruction Manual:**  
[document/manual_de_instrucoes.pdf](document/Manual%20de%20Instruções%20-%20IoTrain.pdf)

## 🗃 Release History

* 0.5.0 - 12/19/2025 - Final documentation and integration between authentication and computer vision.
    
* 0.4.0 - 12/05/2025 - Documentation on the final prototype, testing, and operating flow, plus completion of the dashboard.
    
* 0.3.0 - 11/19/2025 - Requirements documentation (functional and non-functional) and final implementation of the MQTT protocol.
    
* 0.2.0 - 11/07/2025 - Initial documentation of the physical system and replacement of HTTP with MQTT.
    
* 0.1.0 - 10/24/2025 - Documentation of the offline prototype and construction of the circuit fundamentals via Wokwi.
    

## My Contribution

This was a collaborative academic project.

My responsibilities included:

* Built and trained the computer vision module in `src/visao-computacional/`, a YOLOv8m person detection pipeline with CLAHE preprocessing for low light and ByteTrack for keeping IDs stable across frames.
* Implemented the hybrid counting logic used to flag unauthorized people and track how many people are in each room, using the centroid for entries and the bounding box base for exits.
* Integrated this module with the backend built by the rest of the team, sending detection and occupancy events to the API in real time.
* Helped write the project documentation, mainly the parts explaining the technology behind the system.

I was solely responsible for the computer vision layer, from building the detection and tracking model to wiring it into the rest of the system. The embedded hardware (ESP32, RFID, keypad, physical case) was designed and built by other team members.

RFID and a password only confirm that a badge was scanned. They don't confirm how many people are actually in the room. This module gave the project an independent, camera-based count to check against the access logs.

## 📋 License

<a href="https://github.com/Inteli-College/2025-2B-T18-IN02-G04.git">IoTrain</a> © 2025 by <a href="https://github.com/Inteli-College/2025-2B-T18-IN02-G04.git">INTELI, Bruno Martins, Guilherme Valença, Isaac Santos, Jaime Andrade, Richard Alves, Victor Garcia, Victor Grycajuk</a> is licensed under <a href="https://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International</a><img src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" style="max-width: 1em;max-height:1em;margin-left: .2em;"><img src="https://mirrors.creativecommons.org/presskit/icons/by.svg" style="max-width: 1em;max-height:1em;margin-left: .2em;">
