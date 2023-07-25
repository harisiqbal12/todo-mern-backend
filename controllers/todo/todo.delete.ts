import { Request, Response } from 'express';

import { Todo, UserResponse, TodoInput } from '../../models';
import AppError from '../../errors';

type Data = {
	success: boolean;
	error: boolean;
	message: string | null;
	data: TodoInput | null;
};

type R = Request & {
	user?: UserResponse;
};

export default async function handler(req: R, res: Response<Data>) {
	try {
		validateBody(req.body);

		const todoToBeDelete = await Todo.findOne().where({
			_id: req?.body?.todo_id,
			user: req?.user?._id,
		});

		if (!todoToBeDelete?._id)
			throw new AppError('this todo does not belongs to you', 401);

		const todo = await Todo.findByIdAndDelete(todoToBeDelete._id);

		res
			.status(200)
			.json({ success: true, error: false, message: 'Deleted', data: todo });
	} catch (err: unknown) {
		console.log(err);
		if (err instanceof AppError) {
			res.status(err.statusCode).json({
				success: false,
				error: true,
				message: 'todo is deleted',
				data: null,
			});

			return;
		}

		res.status(500).json({
			success: false,
			error: true,
			message: 'internal server error',
			data: null,
		});
	}
}

function validateBody(body: any) {
	if (!body?.todo_id) {
		throw new AppError('please provide todo id', 400);
	}
}
