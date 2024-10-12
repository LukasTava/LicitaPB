const express = require('express');
const router = express.Router();
const { listarLicitacoes } = require('../controllers/licitacoesController');

// Rota para listar todas as licitações
router.get('/', listarLicitacoes);

module.exports = router;
