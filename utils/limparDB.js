// limparDB.js
require('dotenv').config();
const mongoose = require('mongoose');

// Função para conectar ao banco de dados
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Conectado ao banco de dados');
    } catch (error) {
        console.error('Erro ao conectar ao banco de dados:', error);
        process.exit(1);
    }
}

// Função para limpar os dados de todas as coleções do banco de dados
async function limparBancoDeDados() {
    try {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            if (collections.hasOwnProperty(key)) {
                await collections[key].deleteMany({});
            }
        }
        console.log('Todos os dados do banco de dados foram limpos com sucesso');
    } catch (error) {
        console.error('Erro ao limpar os dados do banco de dados:', error);
    } finally {
        mongoose.connection.close();
    }
}

// Função principal para executar a limpeza
(async () => {
    await connectDB();
    await limparBancoDeDados();
})();