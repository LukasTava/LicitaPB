require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const licitacaoRoutes = require('./routes/licitacaoRoutes');

const app = express();

// Conectar ao banco de dados
const startServer = async () => {
    await connectDB(); // Isso agora vai usar a função connectDB que carrega a URI do .env
    app.listen(3000, () => {
        console.log('Servidor rodando em http://localhost:3000');
    });
};

// Middleware para express entender JSON
app.use(express.json());

// Definindo rotas
app.use('/licitacoes', licitacaoRoutes);

startServer();
