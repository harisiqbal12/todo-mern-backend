import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { User, UserInput } from '../../models';
import AppError from '../../errors/index';

type Data = {
	success: boolean;
	error: boolean;
	user: UserInput | null;
	message: string | null;
};

export default async function handler(req: Request, res: Response<Data>) {
	try {
		validateBody(req?.body);

		const secret: string = process.env.JWTSECRET || '';

		const response = await new Promise((resolve, reject) => {
			jwt.verify(
				req?.body?.token,
				secret,
				{
					complete: true,
				},
				(err, decode) => {
					if (err) {
						reject(new AppError('Invalid signature or expired token', 422));
					}

					resolve(decode);
				}
			);
		});

		//@ts-ignore
		const user = await User.findById(response.payload?.id);

		console.log(user);

		res.status(200).json({
			success: true,
			error: false,
			user,
			message: null,
		});
	} catch (err: unknown) {
		if (err instanceof AppError) {
			res.status(err?.statusCode).json({
				success: false,
				error: true,
				user: null,
				message: err?.message,
			});

			return;
		}

		res.status(500).json({
			success: false,
			error: true,
			user: null,
			message: 'internal server error',
		});
		console.log(err);
	}
}

function validateBody(body: any) {
	if (!body?.token) {
		throw new AppError('Provide token', 400);
	}
}
