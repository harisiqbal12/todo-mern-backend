import express from 'express';
import { todo, restrict } from '../../controllers';

const router = express.Router();

router.use('/todo', restrict);

router
	.route('/todo')
	.post(todo.createTodo)
	.get(todo.allTodo)
	.put(todo.updateTodo)
	.delete(todo.deleteTodo);

export default router;
