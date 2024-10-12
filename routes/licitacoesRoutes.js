// routes/licitacoesRoutes.js

const express = require('express');
const router = express.Router();
const Licitacao = require('../models/licitacao');

// Rota para listar todas as licitações
router.get('/', async (req, res) => {
    try {
        const licitacoes = await Licitacao.find();
        res.render('licitacoes', { licitacoes });
    } catch (err) {
        res.status(500).send('Erro ao buscar licitações.');
    }
});

// Rota para renderizar o formulário de edição
router.get('/edit/:id', async (req, res) => {
    try {
        const licitacao = await Licitacao.findById(req.params.id);
        res.render('editLicitacao', { licitacao });
    } catch (err) {
        res.status(500).send('Erro ao buscar licitação para edição.');
    }
});

// Rota para atualizar a licitação
router.post('/edit/:id', async (req, res) => {
    try {
        await Licitacao.findByIdAndUpdate(req.params.id, req.body);
        res.redirect('/licitacoes');
    } catch (err) {
        res.status(500).send('Erro ao atualizar a licitação.');
    }
});

// Rota para excluir a licitação
router.get('/delete/:id', async (req, res) => {
    try {
        await Licitacao.findByIdAndDelete(req.params.id);
        res.redirect('/licitacoes');
    } catch (err) {
        res.status(500).send('Erro ao excluir a licitação.');
    }
});

module.exports = router;
