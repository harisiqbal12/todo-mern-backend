import express from 'express';
import { user } from '../../controllers';

const router = express.Router();

router.route('/signup').post(user.registerUser);
router.route('/login').post(user.loginUser);

export default router;
