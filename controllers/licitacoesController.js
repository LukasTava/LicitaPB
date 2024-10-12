const Licitacao = require('../models/licitacao');

// Função para listar todas as licitações
const listarLicitacoes = async (req, res) => {
  try {
    const licitacoes = await Licitacao.find();
    res.json(licitacoes);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao buscar licitações');
  }
};

module.exports = { listarLicitacoes };
