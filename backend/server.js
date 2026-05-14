const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./db/init');
const lotteryRouter = require('./routes/lottery');
const authRouter = require('./routes/auth');
const numbersRouter = require('./routes/numbers');

const app = express();
const PORT = process.env.PORT || 3001;

initDatabase();

app.use(cors());
app.use(express.json());

app.use('/api/lottery', lotteryRouter);
app.use('/api/auth', authRouter);
app.use('/api/numbers', numbersRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
