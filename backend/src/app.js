const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const deviceRoutes = require('./devices/routes');

const app = express();
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  const database = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(database === 'connected' ? 200 : 503).json({
    status: database === 'connected' ? 'ok' : 'degraded',
    database,
  });
});

app.use('/api/devices', deviceRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Không tìm thấy endpoint ${req.path}.` });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({ message: 'JSON không hợp lệ.' });
  }
  res.status(500).json({ message: 'Lỗi máy chủ. Vui lòng thử lại sau.' });
});

module.exports = app;