import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.use('/api', chatRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'paygate-agent', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`PayGate agent server running on http://localhost:${PORT}`);
  console.log(`Hedera account: ${process.env.HEDERA_ACCOUNT_ID ?? '(not set)'}`);
  console.log(`Audit topic:    ${process.env.HEDERA_AUDIT_TOPIC_ID ?? '(not set — HCS audit disabled)'}`);
});

export default app;
