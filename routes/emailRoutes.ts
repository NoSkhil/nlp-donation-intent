import {Router} from 'express';
import emailController from '../controllers/emailController';

const emailRoutes = Router();

emailRoutes.get('/read', emailController.getAllEmails );

emailRoutes.post('/insert', emailController.insertEmail);

emailRoutes.post('/update', emailController.updateEmail);

emailRoutes.delete('/delete', emailController.deleteEmail);

export default emailRoutes;