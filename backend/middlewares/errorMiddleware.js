function errorHandler(err, req, res, next) {
  // Log completo para debugging
  console.error('Error en la aplicación:', err);
  console.error('Stack trace:', err.stack);
  
  // Para errores de Supabase, dar información más detallada
  if (err.message && err.message.includes('supabase')) {
    console.error('Error de Supabase detectado:', err.details || err.message);
  }
  
  // Enviar respuesta al cliente
  res.status(500).json({ 
    success: false, 
    message: 'Error en el servidor',
    error: err.message || 'Error interno',
    details: process.env.NODE_ENV === 'development' ? (err.details || err.stack) : undefined
  });
}

module.exports = errorHandler;
