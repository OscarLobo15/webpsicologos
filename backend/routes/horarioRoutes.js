const express = require('express');
const router = express.Router();

const { getHorarios, addHorario, deleteHorario } = require('../controllers/horarioController');
const { bloquearHorario, desbloquearHorario } = require('../controllers/bloqueoController');
const authenticate = require('../middlewares/authMiddleware');
const verificarPropietario = require('../middlewares/verificarPropietario');

// Añadimos verificarPropietario para proteger los datos
router.get('/:psicologo_id', authenticate, verificarPropietario, getHorarios);
// Endpoint público para disponibilidad
const { getDisponibilidadPublica } = require('../controllers/horarioController');
router.get('/:psicologo_id/disponibles', getDisponibilidadPublica);
router.post('/:psicologo_id', authenticate, verificarPropietario, addHorario);
router.put('/:id', authenticate, require('../controllers/horarioController').updateHorario);
router.put('/:id/bloquear', authenticate, bloquearHorario);
router.put('/:id/desbloquear', authenticate, desbloquearHorario);
router.delete('/:id', authenticate, deleteHorario);

module.exports = router;