const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const horarioRoutes = require('./routes/horarioRoutes');
const reservaRoutes = require('./routes/reservaRoutes');
const psicologoRoutes = require('./routes/psicologoRoutes');
const locationRoutes = require('./routes/locationRoutes');

// Middlewares
const errorHandler = require('./middlewares/errorMiddleware');

const app = express();
app.use(cors());
app.use(express.json());

// Rutas base
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/horarios', horarioRoutes);
app.use('/api/reservar', reservaRoutes);
app.use('/api/psychologists', psicologoRoutes);
app.use('/api/location', locationRoutes);

// Middleware de errores
app.use(errorHandler);

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
