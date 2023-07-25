import { connect, connection } from 'mongoose';

async function connectMongo() {
	try {
		const uri: string = process.env.MONGODBURI || '';
		await connect(uri);
	} catch (err) {
		await connection.close();
	}
}

export default connectMongo;
