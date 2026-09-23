// ./services/AccessValidationService.js

const bcrypt = require("bcrypt");
const WorkerRepository = require("../repositories/WorkerRepository");
const ServiceRepository = require("../repositories/ServiceRepository");
const AuthorizationRepository = require("../repositories/AuthorizationRepository");

class AccessValidationService {
  // Validar acesso de entrada
  static async validateEntry(rfid_uid, password_hash, room_id, timestamp) {
    // Verificar se worker existe
    const worker = await WorkerRepository.findByRfid(rfid_uid);
    if (!worker) {
      return {
        granted: false,
        message: { line1: "RFID nao", line2: "cadastrado" },
        authorization_id: null,
      };
    }

    // Verificar se worker está ativo
    if (!worker.active) {
      return {
        granted: false,
        message: { line1: "Acesso", line2: "desativado" },
        authorization_id: null,
      };
    }

    // Verificar senha com bcrypt
    const isPasswordValid = await bcrypt.compare(password_hash, worker.password_hash);
    if (!isPasswordValid) {
      return {
        granted: false,
        message: { line1: "Senha", line2: "incorreta" },
        authorization_id: null,
      };
    }

    // Buscar serviços ativos na sala
    const services = await ServiceRepository.findActiveByRoom(room_id);
    if (services.length === 0) {
      return {
        granted: false,
        message: { line1: "Nenhum servico", line2: "ativo na sala" },
        authorization_id: null,
      };
    }

    // Verificar se worker está autorizado em algum serviço válido
    const now = new Date(parseInt(timestamp));

    /*
    console.log("\nDEBUG VALIDAÇÃO");
    console.log("Timestamp recebido:", timestamp);
    console.log("Data/hora UTC:", now.toISOString());
    console.log("Worker:", rfid_uid);
    console.log("Sala:", room_id);
    console.log("Serviços encontrados na sala:", services.length);
    */

    for (const service of services) {

      // Verificar autorização
      const authorization =
        await AuthorizationRepository.findByWorkerAndService(
          rfid_uid,
          service.id
        );

      if (!authorization) {
        continue;
      }

      // Verificar se serviço está dentro da vigência
      const validityStart = new Date(service.validity_start);
      const validityEnd = new Date(service.validity_end);


      if (now < validityStart || now > validityEnd) {
        // fora da vigência
        continue;
      }
      // dentro da vigência

      // Verificar dia da semana
      const weekday = this.getWeekday(now);
      console.log("Dia da semana detectado:", weekday);
      console.log("Dias permitidos no serviço:", service.weekdays);
      console.log("Dia está na lista?", service.weekdays.includes(weekday));

      if (!service.weekdays.includes(weekday)) {
        console.log(`Dia da semana ${weekday} não permitido`);
        continue;
      }
      console.log(`Dia da semana ${weekday} OK`);

      // Verificar horário
      const currentTime = this.formatTime(now);
      console.log("Horário detectado no sistema:", currentTime);
      console.log(
        "Horário permitido:",
        service.start_time,
        "-",
        service.end_time
      );
      console.log(
        "Horário está após início?",
        currentTime >= service.start_time
      );
      console.log(
        "Horário está antes do fim?",
        currentTime <= service.end_time
      );

      if (currentTime < service.start_time || currentTime > service.end_time) {
        // fora do horário
        continue;
      }
      // dentro do horário

      if (!service.active) {
        console.log(`Serviço ${service.id} (${service.name}) está inativo`);
        continue;
      }

      if (service.active && authorization.active) {
        // Acesso autorizado
        return {
          granted: true,
          message: { line1: "Acesso", line2: "permitido" },
          authorization_id: authorization.id,
        };
      } else {
        // Acesso deve ser negado
        if (!authorization.active) {
          return {
            granted: false,
            message: { line1: "Servico", line2: "negado" },
            authorization_id: authorization.id,
          };
        } else {
          return {
            granted: false,
            message: { line1: "Servico", line2: "inativo" },
            authorization_id: authorization.id,
          };
        }
      }
    }

    // Nenhum serviço válido encontrado
    return {
      granted: false,
      message: { line1: "Fora do horario", line2: "permitido" },
      authorization_id: null,
    };
  }

  // Validar acesso de saída (mais simples, não requer senha)
  static async validateExit(rfid_uid, room_id) {
    // Verificar se worker existe
    const worker = await WorkerRepository.findByRfid(rfid_uid);
    if (!worker) {
      return {
        granted: false,
        message: { line1: "RFID nao", line2: "cadastrado" },
        authorization_id: null,
      };
    }

    // Para saída, apenas registrar sem validar horários
    return {
      granted: true,
      message: { line1: "Saida", line2: "registrada" },
      authorization_id: null,
    };
  }

  // Obter dia da semana em formato brasileiro (convertendo para horário de Brasília GMT-3)
  static getWeekday(date) {
    const days = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

    // Usar Intl.DateTimeFormat para obter o dia da semana em São Paulo timezone
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Sao_Paulo",
      weekday: "short",
    });

    // Mapear os dias em inglês para o índice correto
    const dayMap = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };

    const dayShort = formatter.format(date);
    const dayIndex = dayMap[dayShort];

    return days[dayIndex];
  }

  // Formatar hora no formato HH:MM:SS (convertendo para horário de Brasília GMT-3)
  static formatTime(date) {
    // Usar Intl.DateTimeFormat.formatToParts para extrair hora, minuto e segundo em São Paulo timezone
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(date);

    // Extrair cada componente
    const hour = parts.find((p) => p.type === "hour").value;
    const minute = parts.find((p) => p.type === "minute").value;
    const second = parts.find((p) => p.type === "second").value;

    return `${hour}:${minute}:${second}`;
  }
}

module.exports = AccessValidationService;