import express from 'express';
import router from './routers';
import connectMongo from './connect';
import cors from 'cors';

import 'dotenv/config';

const app = express();

app.use(
	cors({
		origin: 'http://localhost:5173', // Change this to the actual frontend origin in production
		credentials: true,
	})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectMongo();
app.use('/', router);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
	console.log(`Server running at ${PORT}`);
});
