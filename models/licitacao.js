const mongoose = require('mongoose');

const LicitacaoSchema = new mongoose.Schema({
    Jurisdicionado: String,
    DocumentoTCENumero: String,
    NumeroLicitacao: String,
    Modalidade: String,
    Tipo: String,
    TipoCompraServico: String,
    Objeto: String,
    DataCertame: Date,
    LocalCertame: String,
    ValorEstimado: String,
    Observacoes: String,
    municipioIdentificado: String 
}, { collection: 'licitacoes' });
const Licitacao = mongoose.model('Licitacao', LicitacaoSchema);
module.exports = Licitacao;
