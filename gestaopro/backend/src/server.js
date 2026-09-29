import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import dashboardRoutes from './routes/dashboard.js';
import relatoriosRoutes from './routes/relatorios.js';

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

app.get('/', (req, res) => res.json({ ok: true, api: 'GestãoPro backend' }));
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/relatorios', relatoriosRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`GestãoPro backend a correr em http://localhost:${PORT}`));
