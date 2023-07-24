import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import AppError from '../../errors';
import { User } from '../../models';

type Data = {
	success: boolean;
	error: boolean;
	message: string;
};

export default async function handler(
	req: Request,
	res: Response<Data>,
	next: NextFunction
) {
	try {
		let token: string = '';
		const secret: string = process.env.JWTSECRET || '';

		if (
			req?.headers?.authorization &&
			req?.headers?.authorization?.startsWith('Bearer')
		) {
			token = req.headers.authorization.split(' ')[1];
		}

		if (req.cookies?.jwt) {
			token = req.cookies.jwt;
		}

		if (!token) {
			throw new AppError('Please logged in first', 401);
		}

		const decoded = await new Promise((resolve, reject) => {
			jwt.verify(token, secret, { complete: true }, (err, decoded) => {
				if (err) reject(err);

				resolve(decoded);
			});
		});

		//@ts-ignore
		const user = await User.findById(decoded?.payload?.id);
		console.log(user?.email);

		if (!user?.email) {
			throw new AppError('User not exists', 404);
		}

		Object.assign(req, {
			user,
		});

		next();
	} catch (err: unknown) {
		if (err instanceof AppError) {
			res.status(err.statusCode).json({
				success: false,
				error: true,
				message: err?.message,
			});
			return;
		}

		res.status(500).json({
			success: false,
			error: true,
			message: 'internal server error',
		});
	}
}
