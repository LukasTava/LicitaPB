const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function baixarPDF(downloadDirectory) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: path.resolve(downloadDirectory),
    });

    try {
        const url = 'https://tce.pb.gov.br/diario-oficial-eletronico';
        console.log('Acessando URL:', url);
        await page.goto(url, { waitUntil: 'networkidle2' });

        const linkSelector = 'table tbody tr:first-child td:nth-child(3) a';
        await page.waitForSelector(linkSelector);

        console.log('Seletor encontrado, clicando para fazer o download...');
        await page.click(linkSelector);

        let pdfDownloaded = false;
        const maxAttempts = 30;
        let attempts = 0;

        while (!pdfDownloaded && attempts < maxAttempts) {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 1000));
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

module.exports = baixarPDF;
