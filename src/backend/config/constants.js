// ./config/constants.js

// Tipos de eventos de acesso
const EVENT_TYPES = {
  ENTRY: "entry",
  EXIT: "exit",
};

// Tipos de resposta
const RESPONSE_TYPES = {
  SUCCESS: "success",
  DENIED: "denied",
  ERROR: "error",
};

// Durações de exibição (em milissegundos)
const DISPLAY_DURATIONS = {
  SUCCESS: 3000,
  ERROR: 5000,
};

// Dias da semana
const WEEKDAYS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

module.exports = {
  EVENT_TYPES,
  RESPONSE_TYPES,
  DISPLAY_DURATIONS,
  WEEKDAYS,
};
