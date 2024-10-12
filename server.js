// server.js

const express = require('express');
const connectDB = require('./config/db');
const licitacoesRoutes = require('./routes/licitacoesRoutes');

const app = express();

// Conectar ao MongoDB
connectDB();

// Configurações de middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs'); // Configurar a engine de views

// Usar as rotas de licitações
app.use('/licitacoes', licitacoesRoutes);

// Definir a rota raiz para redirecionar para /licitacoes
app.get('/', (req, res) => {
    res.redirect('/licitacoes'); // Redireciona para a página de licitações
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
