const Licitacao = require('../models/licitacao');
const fs = require('fs');
const path = require('path');

// Carregar a lista de municípios
let municipios = [];
try {
    const municipiosPath = path.join(__dirname, '../public/municipios.json');
    const municipiosData = fs.readFileSync(municipiosPath, 'utf8');
    municipios = JSON.parse(municipiosData).municipios;
} catch (error) {
    console.error("Erro ao carregar o arquivo de municípios:", error);
}

// Função para normalizar o nome do município
function identificarMunicipio(nomeLicitacao) {
    for (const municipio of municipios) {
        if (nomeLicitacao.toLowerCase().includes(municipio.toLowerCase())) {
            return municipio;
        }
    }
    return "Governo do Estado da Paraíba"; // Caso não seja encontrado nenhum município
}

// Função para obter licitações associadas ao município
const getLicitacoesPorMunicipio = async (req, res) => {
  try {
      const licitacoes = await Licitacao.find({});
      const licitacoesPorMunicipio = {};

      licitacoes.forEach(licitacao => {
          const municipio = identificarMunicipio(licitacao.Jurisdicionado);
          if (!licitacoesPorMunicipio[municipio]) {
              licitacoesPorMunicipio[municipio] = [];
          }
          licitacoesPorMunicipio[municipio].push(licitacao);
      });

      res.json(licitacoesPorMunicipio);
  } catch (error) {
      console.error("Erro ao buscar licitações:", error);
      res.status(500).json({ error: 'Erro ao buscar licitações.' });
  }
};
function organizarLicitacoesPorMunicipio(licitacoes) {
  const licitacoesPorMunicipio = {};

  licitacoes.forEach(licitacao => {
    const municipio = licitacao.municipio || "Governo do Estado da Paraíba";

    // Se o município ainda não existir no objeto, inicializa-o com uma lista vazia
    if (!licitacoesPorMunicipio[municipio]) {
      licitacoesPorMunicipio[municipio] = [];
    }

    // Adiciona a licitação ao município correspondente
    licitacoesPorMunicipio[municipio].push(licitacao);
  });

  return licitacoesPorMunicipio;
}

module.exports = {
  organizarLicitacoesPorMunicipio,
    getLicitacoesPorMunicipio
};
