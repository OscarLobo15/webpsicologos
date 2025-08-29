const jwt = require('jsonwebtoken');

// Middleware para verificar que el usuario solo pueda acceder a sus propios recursos
function verificarPropietario(req, res, next) {
  // El ID del psicólogo que se está consultando (de la URL)
  const requestedId = parseInt(req.params.psicologo_id);
  
  // El ID del usuario autenticado (del token)
  const userId = req.user.id;

  // Verificar que los IDs coincidan
  if (requestedId !== userId) {
    return res.status(403).json({
      success: false,
      message: "No tienes permiso para acceder a estos datos. Solo puedes ver tus propios recursos."
    });
  }

  // Si coinciden, continuar
  next();
}

module.exports = verificarPropietario;
