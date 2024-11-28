const fs = require('fs');
const path = require('path');

// Caminho do arquivo JSON com os municípios (agora na pasta `public`)
const municipiosPath = path.join(__dirname, '../public/municipios.json');

// Carregar a lista de municípios da Paraíba
let municipios = [];
try {
  const data = fs.readFileSync(municipiosPath, 'utf-8');
  municipios = JSON.parse(data);
} catch (error) {
  console.error("Erro ao carregar a lista de municípios:", error);
}

// Função para normalizar o nome do município a partir do nome do jurisdicionado
function getMunicipioFromJurisdicionado(jurisdicionado) {
  // Garantir que o `jurisdicionado` é uma string válida, se não, retornar padrão
  if (!jurisdicionado || typeof jurisdicionado !== 'string') {
    return "Governo do Estado da Paraíba";
  }

  // Regex para remover prefixos como "Prefeitura Municipal de", "Fundo Municipal de Saúde de", etc.
  const regexPrefix = /^(Prefeitura Municipal de|Fundo Municipal de Saúde de|Câmara Municipal de|Fundo Municipal de|Secretaria Municipal de|Fundo de Assistência Social de|Fundo de Saúde de)\s*/i;

  // Remover o prefixo do nome do jurisdicionado e garantir que o resultado seja válido
  const nomeSemPrefixo = jurisdicionado.replace(regexPrefix, '').trim();

  if (!nomeSemPrefixo) {
    return "Governo do Estado da Paraíba";
  }

  // Procurar um município que corresponda ao nome resultante
  for (const municipio of municipios) {
    if (nomeSemPrefixo.toLowerCase() === municipio.nome.toLowerCase()) {
      return municipio.nome; // Nome do município encontrado na lista
    }
  }

  // Caso o município não seja identificado, retornar "Governo do Estado da Paraíba"
  return "Governo do Estado da Paraíba";
}

// Função para organizar licitações por município
function organizarLicitacoesPorMunicipio(licitacoes) {
  const licitacoesPorMunicipio = {};

  licitacoes.forEach(licitacao => {
    const municipio = getMunicipioFromJurisdicionado(licitacao.Jurisdicionado);

    // Se o município ainda não existir no objeto, inicializa-o com uma lista vazia
    if (!licitacoesPorMunicipio[municipio]) {
      licitacoesPorMunicipio[municipio] = [];
    }

    // Adiciona a licitação ao município correspondente
    licitacoesPorMunicipio[municipio].push(licitacao);
  });

  return licitacoesPorMunicipio;
}

// Exportar funções para uso no programa
module.exports = {
  getMunicipioFromJurisdicionado,
  organizarLicitacoesPorMunicipio
};
