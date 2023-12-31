import { Request, Response } from 'express';
import cookie from 'cookie';

import { signToken } from '../../utils';
import { UserInput, User } from '../../models';
import AppError from '../../errors';

type Data = {
	success: boolean;
	error: boolean;
	message: string | null;
	data: {
		name: string | undefined;
		email: string | undefined;
	} | null;
	token: string | null;
};

export default async function handler(req: Request, res: Response<Data>) {
	try {
		validateBody(req.body);

		const user: UserInput = {
			name: req?.body?.name,
			email: req?.body?.email,
			password: req?.body?.password,
		};

		const createdUser = await User.create(user);
		const token = signToken(createdUser._id);

		const maxAgeInSeconds = 24 * 60 * 60;
		const options = {
			maxAge: maxAgeInSeconds,
			httpOnly: false,
			secure: false,
			path: '/',
		};

		const cookieString = cookie.serialize('jwt', token, options);
		res.setHeader('Set-Cookie', cookieString);
		res.setHeader('Authorization', `Bearer ${token}`);

		res.status(200).json({
			success: true,
			error: false,
			message: 'User created',
			data: {
				name: createdUser.name,
				email: createdUser.email,
			},
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

		//@ts-ignore
		if (err?.code === 11000) {
			res.status(409).json({
				success: false,
				error: true,
				message: 'User is already exists',
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

	if (!body?.name) {
		missingFields.push('name');
		isError = true;
	}

	if (!body?.email) {
		missingFields?.push('email');
		isError = true;
	}

	if (!body?.password) {
		missingFields?.push('password');
		isError = true;
	}

	if (isError)
		throw new AppError(
			`${missingFields?.join(',')} is missing from the body`,
			400
		);

	if (!body?.email?.includes('@') || !body?.email?.includes('.com'))
		throw new AppError('Invalid email entity', 422);

	if (body?.password?.length < 8)
		throw new AppError('password is too short', 422);
}
