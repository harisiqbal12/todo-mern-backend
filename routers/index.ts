import express from 'express';
import todoRouter from './todo';
import userRouter from './user';

const router = express.Router();

router.route('/').get((req, res) => {
	res.status(200).send('<h2>Todo Backend</h2>');
});

router.use('/api', todoRouter);
router.use('/api', userRouter);

export default router;
