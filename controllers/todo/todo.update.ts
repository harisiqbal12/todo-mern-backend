import { Request, Response } from 'express';
import AppError from '../../errors';
import { Todo, UserResponse, TodoInput } from '../../models';

type Data = {
	success: boolean;
	error: boolean;
	message: string;
	data?: TodoInput | null;
};

type R = Request & {
	user?: UserResponse;
};

export default async function handler(req: R, res: Response<Data>) {
	try {
		validateBody(req.body);

		const todo = await Todo.findOneAndUpdate(
			{
				_id: req?.body?.todo_id,
				user: req?.user?._id,
			},
			{
				title: req?.body?.title,
				description: req?.body?.description,
				status: req?.body?.status,
			},
			{
				new: true,
			}
		);

		res
			.status(200)
			.json({ success: true, error: false, message: 'Updated Todo', data: todo });
	} catch (err: unknown) {
		if (err instanceof AppError) {
			res.status(err.statusCode).json({
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
	if (!body?.todo_id) {
		throw new AppError('please provide todo id', 400);
	}

	if (!body?.title && !body?.description && !body?.status) {
		throw new AppError('please provide the todo data', 400);
	}
}
