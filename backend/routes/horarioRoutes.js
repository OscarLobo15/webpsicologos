const express = require('express');
const router = express.Router();

const { getHorarios, addHorario, deleteHorario } = require('../controllers/horarioController');
const authenticate = require('../middlewares/authMiddleware');

router.get('/:psicologo_id', authenticate, getHorarios);
// Endpoint público para disponibilidad
const { getDisponibilidadPublica } = require('../controllers/horarioController');
router.get('/:psicologo_id/disponibles', getDisponibilidadPublica);
router.post('/:psicologo_id', authenticate, addHorario);
router.put('/:id', authenticate, require('../controllers/horarioController').updateHorario);
router.delete('/:id', authenticate, deleteHorario);

module.exports = router;