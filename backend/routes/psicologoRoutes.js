const express = require('express');
const router = express.Router();
const { listarPsicologos, obtenerPsicologo } = require('../controllers/psicologoController');

router.get('/', listarPsicologos);
router.get('/:id', obtenerPsicologo);

module.exports = router;