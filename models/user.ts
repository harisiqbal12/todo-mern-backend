import mongoose, { Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';

type UserDocument = Document & {
	name: string;
	password: string;
	email: string;
	correctPassword: (
		requestPassword: string,
		userPassword: string
	) => Promise<void>;
};

type UserInput = {
	name: UserDocument['name'];
	password: UserDocument['password'];
	email: UserDocument['email'];
};

type UserResponse = {
	name: string;
	email: string;
	_id: string;
	createdAt: string;
	updatedAt: string;
};

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'user must provide a name'],
		},
		email: {
			type: String,
			required: [true, 'user must provide a email'],
			unique: true,
			index: true,
			lowercase: true,
			trim: true,
			validate: {
				validator: function (val: string) {
					return val?.includes('@') || val?.includes('.com');
				},

				message: 'please provide a valid email',
			},
		},
		password: {
			type: String,
			required: [true, 'user must provide a password'] as any, // typescript was giving error during compilation. i've tested it so i manullay skip the typecheck of typescript on this.
			select: false,
			minlength: [8, 'password is too short'] as any,
		},
	},
	{
		timestamps: true,
		collection: 'User',
	}
);

userSchema.pre('save', async function (next) {
	const salt = process.env.PASSWORDSALT || '';

	if (!this.isModified('password')) return next();

	this.password = await bcrypt.hash(this.password, salt);

	next();
});

userSchema.methods.correctPassword = async function (
	requestPassword: string,
	userPassword: string
): Promise<boolean> {
	return await bcrypt.compare(requestPassword, userPassword);
};

const User: Model<UserDocument> = mongoose.model<UserDocument>(
	'User',
	userSchema
);

export { User, UserInput, UserDocument, UserResponse };
