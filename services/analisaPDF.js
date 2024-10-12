// analisaPDF.js
const mongoose = require('mongoose');
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const Licitacao = require('../models/licitacao'); // Certifique-se de que o caminho está correto

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

// Função para localizar a seção "Atos dos Jurisdicionados" e extrair dados das licitações
function extractLicitacoes(text) {
    const startSection = "Atos dos Jurisdicionados";
    const endSection = "Outros Atos";

    // Encontrar o índice de início da seção "Atos dos Jurisdicionados" após o sumário
    let startIndex = text.indexOf(startSection);
    if (startIndex === -1) {
        console.error('Seção "Atos dos Jurisdicionados" não encontrada no PDF.');
        return [];
    }

    // Procurar o próximo cabeçalho de seção para determinar onde termina a seção de interesse
    let endIndex = text.indexOf(endSection, startIndex);
    if (endIndex === -1) {
        endIndex = text.length; // Se não encontrar "Outros Atos", considere o final do texto
    }

    // Extrair apenas a seção "Atos dos Jurisdicionados"
    const licitacoesSection = text.slice(startIndex, endIndex);

    // Extrair informações da seção "Atos dos Jurisdicionados"
    const licitacoes = [];
    const lines = licitacoesSection.split('\n');
    let currentLicitacao = {};
    let collectingObjeto = false;
    let objetoContent = '';

    lines.forEach(line => {
        // Começar a coletar informações apenas se a seção estiver correta
        if (line.includes("Jurisdicionado:")) {
            // Salva a licitação atual antes de começar uma nova
            if (Object.keys(currentLicitacao).length > 0) {
                licitacoes.push(currentLicitacao);
                console.log('Licitação adicionada:', currentLicitacao);
                currentLicitacao = {};
                collectingObjeto = false;
                objetoContent = '';
            }
            currentLicitacao['Jurisdicionado'] = line.split("Jurisdicionado:")[1].trim();
        } else if (line.includes("Documento TCE nº:")) {
            currentLicitacao['DocumentoTCENumero'] = line.split("Documento TCE nº:")[1].trim();
        } else if (line.includes("Número da Licitação:")) {
            currentLicitacao['NumeroLicitacao'] = line.split("Número da Licitação:")[1].trim();
        } else if (line.includes("Modalidade:")) {
            currentLicitacao['Modalidade'] = line.split("Modalidade:")[1].trim();
        } else if (line.includes("Tipo:")) {
            currentLicitacao['Tipo'] = line.split("Tipo:")[1].trim();
        } else if (line.includes("Tipo de Compra ou Serviço:")) {
            currentLicitacao['TipoCompraServico'] = line.split("Tipo de Compra ou Serviço:")[1].trim();
        } else if (line.includes("Objeto:")) {
            collectingObjeto = true;
            objetoContent = line.split("Objeto:")[1].trim();
        } else if (collectingObjeto) {
            if (line.includes("Data do Certame:")) {
                collectingObjeto = false;
                currentLicitacao['Objeto'] = objetoContent;
                const rawDate = line.split("Data do Certame:")[1].trim();
                currentLicitacao['DataCertame'] = parseDate(rawDate);
            } else {
                objetoContent += ' ' + line.trim();
                console.log('Coletando linha do Objeto:', line);
            }
        } else if (line.includes("Local do Certame:")) {
            currentLicitacao['LocalCertame'] = line.split("Local do Certame:")[1].trim();
        } else if (line.includes("Valor Estimado:")) {
            currentLicitacao['ValorEstimado'] = line.split("Valor Estimado:")[1].trim();
        } else if (line.includes("Observações:")) {
            currentLicitacao['Observacoes'] = line.split("Observações:")[1].trim();
        }
    });

    // Adicionar a última licitação (se houver)
    if (Object.keys(currentLicitacao).length > 0) {
        licitacoes.push(currentLicitacao);
        console.log('Licitação adicionada:', currentLicitacao);
    }

    console.log('Licitações extraídas:', licitacoes);
    return licitacoes;
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

        // Excluir o arquivo PDF após processamento (de forma assíncrona)
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

// Exportar as funções
module.exports = {
    processPdf,
    extractTextFromPdf
};
