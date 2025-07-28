const express = require('express');
const router = express.Router();
const { getHorarios, addHorario, deleteHorario } = require('../controllers/horarioController');

router.get('/:psicologo_id', getHorarios);
router.post('/:psicologo_id', addHorario);
router.delete('/:id', deleteHorario);

module.exports = router;