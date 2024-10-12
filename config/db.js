const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI; // Certifique-se de que esta variável está sendo carregada corretamente.
        if (!uri) {
            throw new Error("MONGO_URI não está definida. Verifique suas variáveis de ambiente.");
        }
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Conectado ao MongoDB com sucesso');
    } catch (error) {
        console.error('Erro ao conectar ao MongoDB:', error);
        process.exit(1); // Sair do processo com erro
    }
};

module.exports = connectDB;
