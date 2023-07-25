import { Request, Response } from 'express';

import cookie from 'cookie';

import { UserInput, User } from '../../models';
import AppError from '../../errors';
import { signToken } from '../../utils';

type Data = {
	success: boolean;
	error: boolean;
	message: string | null;
	data: UserInput | null;
	token: string | null;
};

export default async function handler(req: Request, res: Response<Data>) {
	try {
		validateBody(req?.body);


		const user = await User.findOne({ email: req?.body?.email }).select(
			'+password'
		);

		const isPaswordMatch = await user?.correctPassword(
			req?.body?.password,
			user?.password
		);

		if (!isPaswordMatch) {
			throw new AppError('Invalid password or email', 401);
		}

		const token = signToken(user?._id);

		const maxAgeInSeconds = 24 * 60 * 60;
		const options = {
			maxAge: maxAgeInSeconds,
			httpOnly: false,
			secure: false,
			path: '/',
		};

		//@ts-ignore
		const cookieString = cookie.serialize('jwt', token, options);
		res.setHeader('Set-Cookie', cookieString);
		res.setHeader('Authorization', `Bearer ${token}`);

		res.status(200).json({
			success: true,
			error: false,
			message: 'Logged in',
			data: null,
			token: token,
		});
	} catch (err: unknown) {
		if (err instanceof AppError) {
			res.status(err.statusCode).json({
				success: false,
				error: true,
				message: err.message,
				data: null,
				token: null,
			});
			return;
		}

		res.status(500).json({
			success: false,
			error: true,
			message: 'internal server error',
			data: null,
			token: null,
		});
	}
}

function validateBody(body: any) {
	let missingFields = [];
	let isError: boolean = false;

	if (!body?.email) {
		missingFields.push('email');
		isError = true;
	}

	if (!body?.password) {
		missingFields.push('password');
		isError = true;
	}

	if (isError)
		throw new AppError(
			`${missingFields?.join(',')} is missing from the body`,
			400
		);

	if (!body?.email?.includes('@') || !body?.email?.includes('.com')) {
		throw new AppError('Invalid email address', 422);
	}

	if (body?.password?.length < 8)
		throw new AppError('Password is too short', 422);
}
