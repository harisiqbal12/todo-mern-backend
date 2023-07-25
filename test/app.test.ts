import request from 'supertest';
import { connect, connection } from 'mongoose';
import app from '../server.test';

const testToken =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0YmU5MWIyOTRmNDYyZWI5MzJkOTY3MSIsImlhdCI6MTY5MDMwMDM2NiwiZXhwIjoxNjkwMzg2NzY2fQ.h5eG0zFwOstofqRctcKiaApjzyw0NV4VDQYpNwJjxwU';

beforeEach(async () => {
	await connect(process.env.MONGODBURI || '');
});

afterEach(async () => {
	await connection.close();
});

describe('Sample Test', () => {
	it('Should test that true === true', () => {
		expect(true).toBe(true);
	});
});

describe('POST /api/signup', () => {
	it('Invalid body (Bad Request)', async () => {
		const res = await request(app).post('/api/signup');
		expect(res.statusCode).toBe(400);
	});
	it('Invalid email (unprocessable entity)', async () => {
		const res = await request(app).post('/api/signup').send({
			name: 'Haris Iqbal',
			email: 'invalidemail',
			password: 'haris123',
		});

		expect(res.statusCode).toBe(422);
	});
	it('Short password (unprocessable entity)', async () => {
		const res = await request(app).post('/api/signup').send({
			name: 'Haris Iqbal',
			email: 'haris6072@gmail.com',
			password: 'haris',
		});

		expect(res.statusCode).toBe(422);
	});
	it('Signup with existing email', async () => {
		const res = await request(app).post('/api/signup').send({
			name: 'Haris Iqbal',
			email: 'haris6072@gmail.com',
			password: 'harisiqbal',
		});

		expect(res.statusCode).toBe(409);
	});
	// it('Create an account', async () => {
	// 	const res = await request(app).post('/api/signup').send({
	// 		name: 'Haris Iqbal',
	// 		email: 'harisiqbal.work@gmail.com',
	// 		password: 'haris12345',
	// 	});

	// 	console.log(res);

	// 	expect(res.statusCode).toBe(200);
	// });
});

describe('GET /api/todo', () => {
	it('Can not access without autorization', async () => {
		const res = await request(app).get('/api/todo');
		expect(res.statusCode).toBe(401);
	});

	it('All the todos of user', async () => {
		const res = await request(app)
			.get('/api/todo')
			.set('Authorization', `Bearer ${testToken}`); // haris6072@gmail.com user todos

		expect(res.statusCode).toBe(200);
		expect(res.body.success);
	});
});

describe('POST, DELETE, UPDATE /api/todo', () => {
	let createdTodoId = '';

	it('Can not create without authorization (Not Authorize)', async () => {
		const res = await request(app).post('/api/todo').send({});
		expect(res.statusCode).toBe(401);
	});

	it('Missing required field in body (Bad Requst)', async () => {
		const res = await request(app)
			.post('/api/todo')
			.set('Authorization', `Bearer ${testToken}`)
			.send({});

		expect(res.statusCode).toBe(400);
	});

	it('Create todo', async () => {
		const createdTodo = await request(app)
			.post('/api/todo')
			.set('Authorization', `Bearer ${testToken}`)
			.send({
				title: 'Todo with unit testing',
				description: 'Todo created with unit testing',
			});

		createdTodoId = createdTodo.body.data._id;

		expect(createdTodo.statusCode).toBe(201);
	});

	it('Can not UPDATE without authorization (Not Authorize)', async () => {
		const res = await request(app).put('/api/todo').send({});

		expect(res.statusCode).toBe(401);
	});

	it('Empty body (UPDATE)', async () => {
		const res = await request(app)
			.put('/api/todo')
			.set('Authorization', `Bearer ${testToken}`)
			.send({});

		expect(res.statusCode).toBe(400);
	});

	it('Should update todo', async () => {
		const res = await request(app)
			.put('/api/todo')
			.set('Authorization', `Bearer ${testToken}`)
			.send({
				todo_id: createdTodoId,
				title: 'Updated with unit testing',
			});

		expect(res.statusCode).toBe(200);
	});

	it('Can not DELETE without authorization (Not Authorize)', async () => {
		const res = await request(app).delete('/api/todo').send({
			todo_id: createdTodoId,
		});

		expect(res.statusCode).toBe(401);
	});

	it('Can not DELETE without todo id (Bad Request)', async () => {
		const res = await request(app)
			.delete('/api/todo')
			.set('Authorization', `Bearer ${testToken}`);

		expect(res.statusCode).toBe(400);
	});

	it('DELETE todo', async () => {
		const res = await request(app)
			.delete('/api/todo')
			.set('Authorization', `Bearer ${testToken}`)
			.send({
				todo_id: createdTodoId,
			});

		expect(res.statusCode).toBe(200);
	});
});

describe('POST /api/login', () => {
	it('Cannot access if missing body (Bad Request)', async () => {
		const res = await request(app).post('/api/login');

		expect(res.statusCode).toBe(400);
	});

	it('Invalid email (Unprocessable entity)', async () => {
		const res = await request(app).post('/api/login').send({
			email: 'harisiqbal',
			password: 'haris',
		});

		expect(res.statusCode).toBe(422);
	});

	it('Invalid password (Unprocessable entity)', async () => {
		const res = await request(app).post('/api/login').send({
			email: 'haris6072@gmail.com',
			password: 'haris',
		});

		expect(res.statusCode).toBe(422);
	});

	it('Incorrect Email', async () => {
		const res = await request(app).post('/api/login').send({
			email: 'email@.gmail.com',
			password: 'harisiqbal',
		});

		expect(res.statusCode).toBe(401);
	});

	it('Incorrect password', async () => {
		const res = await request(app).post('/api/login').send({
			email: 'haris6072@gmail.com',
			password: 'haris12345',
		});

		expect(res.statusCode).toBe(401);
	});

	it('Logged in', async () => {
		const res = await request(app).post('/api/login').send({
			email: 'haris6072@gmail.com',
			password: 'harisiqbal',
		});

		expect(res.statusCode).toBe(200);
	});
});
