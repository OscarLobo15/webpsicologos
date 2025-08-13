const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const horarioRoutes = require('./routes/horarioRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reservaRoutes = require('./routes/reservaRoutes');
const psicologoRoutes = require('./routes/psicologoRoutes');
const locationRoutes = require('./routes/locationRoutes');
const usuarioRoutes = require('./routes/usuarios');

// Middlewares
const errorHandler = require('./middlewares/errorMiddleware');

const app = express();
app.use(cors());
app.use(express.json());

// Rutas base
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/horarios', horarioRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reservas', reservaRoutes);
app.use('/api/psychologists', psicologoRoutes);
app.use('/api/location', locationRoutes);

// Middleware de errores
app.use(errorHandler);

app.use("/api", usuarioRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
