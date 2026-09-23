// ./middlewares/errorHandler.js

function errorHandler(err, req, res, next) {
  console.error("Erro capturado:", err.message);

  // Resposta padrão de erro
  const response = {
    request_id: req.body?.request_id || "unknown",
    response_type: "error",
    access_granted: false,
    message: {
      line1: "Erro no servidor",
      line2: "Tente novamente",
    },
    display_duration: 5000,
    message_hash: "", // TODO: implementar hash futuramente
  };

  res.status(500).json(response);
}

module.exports = errorHandler;
