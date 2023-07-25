import { Request, Response } from 'express';

import { UserResponse, Todo, TodoInput } from '../../models';
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

		const input: TodoInput = {
			title: req?.body?.title,
			description: req?.body?.description,
			status: true,
			user: req?.user,
		};

		const todo = await Todo.create(input);


		res
			.status(201)
			.json({ success: true, error: false, message: 'Created Todo', data: todo });
	} catch (err) {
		if (err instanceof AppError) {
			res.status(err?.statusCode).json({
				success: false,
				error: true,
				message: err?.message,
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
	if (!body?.title) {
		throw new AppError('please provide title', 400);
	}
}
