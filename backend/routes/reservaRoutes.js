const express = require('express');
const router = express.Router();
const { reservarHorario, obtenerMisReservas, obtenerReservaPorId, cancelarReserva } = require('../controllers/reservaController');
const verificarToken = require('../middlewares/verificarToken');

router.post('/', verificarToken, reservarHorario);
router.get('/', verificarToken, obtenerMisReservas);
router.get('/:id', verificarToken, obtenerReservaPorId);
router.post('/:id/cancelar', verificarToken, cancelarReserva);

module.exports = router;