import { Request, Response } from 'express';

import { UserResponse, Todo } from '../../models';
import AppError from '../../errors';

type Data = {
	success: boolean;
	error: boolean;
	message: string | null;
	data: Array<any>;
};

type R = Request & {
	user?: UserResponse;
};

export default async function handler(req: R, res: Response<Data>) {
	try {
		const todos = await Todo.find().where({
			user: req?.user?._id,
		});

		res.status(200).json({
			success: true,
			error: false,
			message: 'successfull',
			data: todos,
		});
	} catch (err: unknown) {
		if (err instanceof AppError) {
			res.status(err.statusCode).json({
				success: false,
				error: true,
				message: err?.message,
				data: [],
			});
		}

		res.status(500).json({
			success: false,
			error: true,
			message: 'internal server error',
			data: [],
		});
	}
}
