import jwt from 'jsonwebtoken';

const signToken = (id: string) => {
	const secret = process.env.JWTSECRET || '';

	return jwt.sign(
		{
			id: id,
		},
		secret,
		{
			expiresIn: '24h',
		}
	);
};

export default signToken;
