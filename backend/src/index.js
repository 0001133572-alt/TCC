import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

// Rotas de teste
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'XFlow Backend rodando!' });
});

// Importar rotas
import erpRoutes from './routes/erp/index.js';
import deliveryRoutes from './routes/delivery/index.js';
import authRoutes from './routes/auth/index.js';
import clientRoutes from './routes/clients/index.js';
import paymentsRouter from './routes/erp/payments.js';

// Usar rotas
app.use('/api/erp', erpRoutes);
app.use('/api/erp', paymentsRouter);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`✅ Saúde: http://localhost:${PORT}/api/health`);
});

export default app;