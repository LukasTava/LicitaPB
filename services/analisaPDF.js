const mongoose = require('mongoose');
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const Licitacao = require('../models/licitacao'); 

// Função para extrair texto do PDF ignorando a primeira página
async function extractTextFromPdf(pdfPath) {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    
    // Dividir o texto em páginas e ignorar a primeira página
    const pages = data.text.split(/\f/); // Usa o caractere de form feed (\f) para dividir em páginas
    if (pages.length > 1) {
        pages.shift(); // Remove a primeira página
    }

    // Combina o restante das páginas novamente
    const text = pages.join('\n');
    
    console.log('Texto extraído do PDF (após ignorar a primeira página):', text.substring(0, 500));
    return text;
}

// Função para converter a data para o formato que o Mongoose reconhece
function parseDate(rawDate) {
    const regex = /(\d{2})\/(\d{2})\/(\d{4}) às (\d{2}):(\d{2})/;
    const match = rawDate.match(regex);

    if (match) {
        const [_, day, month, year, hour, minute] = match;
        return new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
    }

    return null;
}

// Função para localizar a seção "Atos dos Jurisdicionados" e extrair dados das licitações
function extractLicitacoes(textoExtraido) {
    const licitacoes = [];
    const linhas = textoExtraido.split('\n');
    
    let licitacao = {
        Jurisdicionado: null,
        DocumentoTCENumero: null,
        NumeroLicitacao: null,
        Modalidade: null,
        Tipo: null,
        TipoCompraServico: null,
        Objeto: '',
        DataCertame: null,
        LocalCertame: null,
        ValorEstimado: null,
        Observacoes: null
    };

    let capturingObjeto = false;

    linhas.forEach((linha) => {
        linha = linha.trim();

        if (linha.startsWith('Jurisdicionado:')) {
            licitacao.Jurisdicionado = linha.replace('Jurisdicionado:', '').trim();
            capturingObjeto = false;
        } else if (linha.startsWith('Documento TCE nº:')) {
            licitacao.DocumentoTCENumero = linha.replace('Documento TCE nº:', '').trim();
            capturingObjeto = false;
        } else if (linha.startsWith('Número da Licitação:')) {
            licitacao.NumeroLicitacao = linha.replace('Número da Licitação:', '').trim();
            capturingObjeto = false;
        } else if (linha.startsWith('Modalidade:')) {
            licitacao.Modalidade = linha.replace('Modalidade:', '').trim();
            capturingObjeto = false;
        } else if (linha.startsWith('Tipo:')) {
            licitacao.Tipo = linha.replace('Tipo:', '').trim();
            capturingObjeto = false;
        } else if (linha.startsWith('Tipo de Compra/Serviço:')) {
            licitacao.TipoCompraServico = linha.replace('Tipo de Compra/Serviço:', '').trim();
            capturingObjeto = false;
        } else if (linha.startsWith('Objeto:')) {
            licitacao.Objeto = linha.replace('Objeto:', '').trim();
            capturingObjeto = true;
        } else if (linha.startsWith('Data do Certame:')) {
            const rawDate = linha.replace('Data do Certame:', '').trim();
            licitacao.DataCertame = parseDate(rawDate);
            capturingObjeto = false;
        } else if (linha.startsWith('Local do Certame:')) {
            licitacao.LocalCertame = linha.replace('Local do Certame:', '').trim();
            capturingObjeto = false;
        } else if (linha.startsWith('Valor Estimado:')) {
            licitacao.ValorEstimado = linha.replace('Valor Estimado:', '').trim();
            capturingObjeto = false;
        } else if (linha.startsWith('Observações:')) {
            licitacao.Observacoes = linha.replace('Observações:', '').trim();
            capturingObjeto = false;
        } else if (linha === '') {
            // Adiciona a licitação atual à lista e reseta o objeto
            if (
                licitacao.Jurisdicionado &&
                licitacao.DocumentoTCENumero &&
                licitacao.NumeroLicitacao &&
                licitacao.Modalidade &&
                licitacao.DataCertame
            ) {
                licitacoes.push({ ...licitacao });
            }
            licitacao = {
                Jurisdicionado: null,
                DocumentoTCENumero: null,
                NumeroLicitacao: null,
                Modalidade: null,
                Tipo: null,
                TipoCompraServico: null,
                Objeto: '',
                DataCertame: null,
                LocalCertame: null,
                ValorEstimado: null,
                Observacoes: null
            };
            capturingObjeto = false;
        } else if (capturingObjeto) {
            // Continua capturando linhas adicionais do Objeto
            licitacao.Objeto += ' ' + linha;
        }
    });

    if (
        licitacao.Jurisdicionado &&
        licitacao.DocumentoTCENumero &&
        licitacao.NumeroLicitacao &&
        licitacao.Modalidade &&
        licitacao.DataCertame
    ) {
        licitacoes.push({ ...licitacao });
    }

    return licitacoes;
}


// Função principal para processar o PDF e extrair licitações
async function processPdf(pdfPath) {
    try {
        // Extrair texto do PDF
        const text = await extractTextFromPdf(pdfPath);

        if (!text || text.trim().length === 0) {
            console.error('Nenhum texto foi extraído do PDF');
            return;
        }

        // Extrair licitações do texto
        const licitacoes = extractLicitacoes(text);

        // Inserir licitações no banco de dados
        if (licitacoes && licitacoes.length > 0) {
            await Licitacao.insertMany(licitacoes);
            console.log(`${licitacoes.length} licitações inseridas no banco de dados.`);
        } else {
            console.log('Nenhuma licitação extraída do PDF.');
        }

        // Excluir o arquivo PDF após processamento 
        fs.unlink(pdfPath, (err) => {
            if (err) {
                console.error('Erro ao excluir o arquivo PDF:', err);
            } else {
                console.log('Arquivo PDF excluído após processamento.');
            }
        });
    } catch (error) {
        console.error('Erro ao processar o PDF:', error);
    }
}
module.exports = {
    processPdf,
    extractTextFromPdf
};
