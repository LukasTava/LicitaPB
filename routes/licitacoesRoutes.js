// routes/licitacaoRoutes.js

const express = require('express');
const Licitacao = require('../models/licitacao'); // Supondo que exista um modelo Licitacao no diretório models

// Cria um roteador do Express
const router = express.Router();

// Rota GET para listar todas as licitações
router.get('/', async (req, res) => {
    try {
        const licitacoes = await Licitacao.find();
        res.json(licitacoes);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar as licitações', error });
    }
});

// Rota POST para criar uma nova licitação
router.post('/', async (req, res) => {
    try {
        const novaLicitacao = new Licitacao(req.body);
        await novaLicitacao.save();
        res.status(201).json(novaLicitacao);
    } catch (error) {
        res.status(400).json({ message: 'Erro ao criar uma licitação', error });
    }
});

module.exports = router;
