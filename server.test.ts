import express from 'express';
import router from './routers';
import cors from 'cors';

import 'dotenv/config';

const app = express();

app.use(
	cors({
		origin: 'http://localhost:5173',
		credentials: true,
	})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', router);

export default app;

// only for testing purpose
