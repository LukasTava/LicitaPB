// downloadPDF.js
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs'); // Corrigindo o erro de importação do fs

async function baixarPDF(downloadDirectory) {
    // Configuração do browser para não abrir janelas
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // Configurar o diretório de download usando uma nova página no Chromium DevTools Protocol
    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: path.resolve(downloadDirectory),
    });

    try {
        // Navegar até o site do TCE-PB
        const url = 'https://tce.pb.gov.br/diario-oficial-eletronico';
        console.log('Acessando URL:', url);
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Procurar o link de download do PDF mais recente
        const linkSelector = 'table tbody tr:first-child td:nth-child(3) a'; // Seleciona o link de download do PDF mais recente
        await page.waitForSelector(linkSelector);

        // Clicar no link de download
        console.log('Seletor encontrado, clicando para fazer o download...');
        await page.click(linkSelector);

        // Monitorar se o arquivo PDF foi baixado completamente
        let pdfDownloaded = false;
        const maxAttempts = 30; // Máximo de tentativas para verificar o download (30 segundos)
        let attempts = 0;

        while (!pdfDownloaded && attempts < maxAttempts) {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo antes de verificar novamente
            const files = fs.readdirSync(downloadDirectory);
            const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));

            if (pdfFiles.length > 0) {
                pdfDownloaded = true;
                console.log('Arquivo PDF encontrado e download concluído.');
            }
        }

        if (!pdfDownloaded) {
            throw new Error('O download do PDF não foi concluído dentro do tempo esperado.');
        }
    } catch (error) {
        console.error('Erro ao baixar o PDF:', error);
    } finally {
        await browser.close();
    }
}

module.exports = baixarPDF; // Exportando corretamente a função baixarPDF
