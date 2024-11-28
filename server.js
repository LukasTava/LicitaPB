const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const Licitacao = require('./models/licitacao'); // Certifique-se de que o caminho está correto

const app = express();

// Conectar ao banco de dados
connectDB();

// Middleware para interpretar JSON
app.use(express.json());

// Configurar EJS como motor de template
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Rota para a lista de licitações
app.get('/licitacoes', async (req, res) => {
    try {
        // Buscar todas as licitações no banco de dados
        const licitacoes = await Licitacao.find();

        // Renderizar a view 'licitacoes' passando as licitações como parâmetro
        res.render('licitacoes', { licitacoes });
    } catch (error) {
        console.error('Erro ao buscar licitações:', error);
        res.status(500).send('Erro ao buscar licitações.');
    }
});

// Configuração da porta do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
