import express, { Express, Request, Response, RequestHandler } from 'express';
import cors from 'cors';

import { connectRabbitMQ, sendToQueue } from './rabbitmq.js';

import routes from './routes/api.js';

const app: Express = express();

app.use(cors());
app.use(express.json());
// Роути /search та /tickets
app.use('/', routes);

// Ініціалізація підключення до RabbitMQ
connectRabbitMQ().catch(error => {
    console.error('RabbitMQ initialization failed:', error);
    process.exit(1);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));
