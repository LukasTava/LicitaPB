// app.js
require('dotenv').config();
const connectDB = require('./config/db');
const { processPdf } = require('./services/analisaPDF');
const baixarPDF = require('./services/downloadPDF'); // Importando a função baixarPDF corretamente
const fs = require('fs');
const path = require('path');

(async () => {
    try {
        // Conectar ao banco de dados
        await connectDB();

        // Baixar o arquivo PDF
        console.log('Iniciando o download do PDF...');
        const downloadDirectory = './documents';
        await baixarPDF(downloadDirectory);

        // Procurar o único arquivo PDF na pasta "documents"
        const files = fs.readdirSync(downloadDirectory);
        const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));

        if (pdfFiles.length !== 1) {
            console.error(`É esperado exatamente um arquivo PDF na pasta "${downloadDirectory}". Encontrado: ${pdfFiles.length}`);
            console.error('Arquivos encontrados:', files);  // Log dos arquivos encontrados na pasta
            return;
        }

        const pdfPath = path.join(downloadDirectory, pdfFiles[0]);
        console.log(`Arquivo PDF encontrado: ${pdfPath}`);  // Log para confirmar o arquivo encontrado

        // Processar o PDF baixado
        await processPdf(pdfPath);
    } catch (error) {
        console.error('Erro ao iniciar o aplicativo:', error);
    }
})();
