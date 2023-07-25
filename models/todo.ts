import mongoose, { Document, Model } from 'mongoose';
import { UserDocument } from './user';

type TodoDocument = Document & {
	title: string;
	description: string;
	status: boolean;
	user: UserDocument['_id'];
};

type TodoInput = {
	title: TodoDocument['title'];
	description: TodoDocument['description'];
	status: TodoDocument['status'];
	user: TodoDocument['user'];
};

const todoSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, 'title is required'],
		},
		description: {
			type: String,
			required: false,
		},
		status: {
			type: Boolean,
			default: true,
		},
		user: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: [true, 'Todo must belong to a user'],
			index: true,
		},
	},
	{
		timestamps: true,
		collection: 'Todo',
	}
);

const Todo: Model<TodoDocument> = mongoose.model<TodoDocument>(
	'Todo',
	todoSchema
);

export { Todo, TodoInput };
