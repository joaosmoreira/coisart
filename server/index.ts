import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import eventRoutes from './routes/eventRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/event', eventRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', app: 'Coisart API', timestamp: new Date() });
});

// Servir o Frontend em Produção (Pasta dist)
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res.json({
      name: 'Coisart Marketplace API',
      status: 'online',
      endpoints: {
        health: '/api/health',
        sellers: '/api/sellers',
        categories: '/api/categories',
        products: '/api/products',
        orders: '/api/orders'
      }
    });
  });
}

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[Coisart Backend] Servidor Express ativo na porta ${PORT}`);
  });
};

startServer().catch(err => {
  console.error('[Coisart Backend] Falha na inicialização do servidor:', err);
});
