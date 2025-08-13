const express = require('express');
const router = express.Router();
const { reservarHorario, obtenerMisReservas } = require('../controllers/reservaController');
const verificarToken = require('../middlewares/verificarToken');

router.post('/', verificarToken, reservarHorario);
router.get('/', verificarToken, obtenerMisReservas); 

module.exports = router;