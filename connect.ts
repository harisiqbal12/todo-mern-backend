import { connect } from 'mongoose';
import bcrypt from 'bcrypt';

async function connectMongo() {
	try {
		const uri: string = process.env.MONGODBURI || '';
		await connect(uri);
		console.log('mongoose connected');
	} catch (err) {
		console.log('error connecting mongoose');
	}
}

export default connectMongo;
