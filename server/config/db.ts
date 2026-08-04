import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/coisart';
    await mongoose.connect(mongoURI);
    console.log(`[MongoDB] Conectado com sucesso a: ${mongoURI}`);
  } catch (error) {
    console.error('[MongoDB] Erro ao ligar à base de dados:', error);
    process.exit(1);
  }
};
