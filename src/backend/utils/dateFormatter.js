// ./utils/dateFormatter.js

class DateFormatter {
  // Converter Date para formato brasileiro GMT-3 (horário de São Paulo)
  static toReadable(date) {
    // Converter para horário de Brasília usando timezone nativo do JavaScript
    const options = {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };

    const parts = new Intl.DateTimeFormat("pt-BR", options).formatToParts(date);

    // Extrair cada componente do resultado
    const day = parts.find((p) => p.type === "day").value;
    const month = parts.find((p) => p.type === "month").value;
    const year = parts.find((p) => p.type === "year").value;
    const hour = parts.find((p) => p.type === "hour").value;
    const minute = parts.find((p) => p.type === "minute").value;
    const second = parts.find((p) => p.type === "second").value;

    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  }
}

module.exports = DateFormatter;
