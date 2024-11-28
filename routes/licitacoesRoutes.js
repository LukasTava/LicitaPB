// routes/licitacoesRoutes.js

const express = require('express');
const router = express.Router();
const Licitacao = require('../models/licitacao');
const { getLicitacoesPorMunicipio } = require('../controllers/licitacoesController');
const { organizarLicitacoesPorMunicipio } = require('../utils/normalizeMunicipios');



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

router.get('/:municipio', async (req, res) => {
    try {
        const municipio = req.params.municipio;
        const licitacoes = await Licitacao.find({ Jurisdicionado: { $regex: municipio, $options: 'i' } });
        res.json(licitacoes);
    } catch (error) {
        res.status(500).send('Erro ao buscar licitações para o município.');
    }
});

router.get('/api/licitacoesPorMunicipio', async (req, res) => {
    try {
      const municipio = req.query.municipio;
  
      if (!municipio) {
        return res.status(400).send("Município não especificado");
      }
  
      // Procurar todas as licitações que pertençam ao município especificado
      const licitacoes = await Licitacao.find({ Jurisdicionado: { $regex: municipio, $options: "i" } });
      res.json(licitacoes);
    } catch (error) {
      console.error('Erro ao buscar licitações por município:', error);
      res.status(500).send('Erro ao buscar licitações por município.');
    }
  });
  
  module.exports = router;

  router.get('/api/licitacoesPorMunicipio', async (req, res) => {
    try {
        const municipio = req.query.municipio;

        if (!municipio) {
            return res.status(400).send("Município não especificado");
        }

        // Buscar todas as licitações do município identificado
        const licitacoes = await Licitacao.find({ municipioIdentificado: municipio });
        res.json(licitacoes);
    } catch (error) {
        console.error('Erro ao buscar licitações por município:', error);
        res.status(500).send('Erro ao buscar licitações por município.');
    }
});
router.get('/licitacoesPorMunicipio', async (req, res) => {
    try {
      // Buscar todas as licitações do banco de dados
      const licitacoes = await Licitacao.find();
  
      // Organizar licitações por município usando a função do módulo
      const licitacoesPorMunicipio = organizarLicitacoesPorMunicipio(licitacoes);
  
      res.json(licitacoesPorMunicipio);
    } catch (error) {
      console.error('Erro ao buscar licitações por município:', error);
      res.status(500).send('Erro ao buscar licitações por município.');
    }
  });
  
module.exports = router;
