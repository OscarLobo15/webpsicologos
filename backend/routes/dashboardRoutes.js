const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authMiddleware');
const verificarPropietario = require('../middlewares/verificarPropietario');
const { getDashboardInfo } = require('../controllers/dashboardController');

// Aplicamos verificarPropietario para asegurar que solo accedan a sus propios datos
router.get('/info/:psicologo_id', authenticate, verificarPropietario, getDashboardInfo);

module.exports = router;
