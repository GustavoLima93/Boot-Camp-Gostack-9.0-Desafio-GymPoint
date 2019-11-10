import { Router } from 'express';

import authMiddleware from './app/middlewares/auth';
import StudentController from './app/controllers/StudentController';
import SessionController from './app/controllers/SessionController';
import PlanController from './app/controllers/PlanController';
import RegistrationController from './app/controllers/RegistrationController';
import CheckinController from './app/controllers/CheckinController';
import HelperController from './app/controllers/HelperController';
import AnswerController from './app/controllers/AnswerController';

const routes = new Router();

routes.get('/students/:id/checkins', CheckinController.store);

routes.post('/students/:id/help-orders', HelperController.store);
routes.get('/students/:id/help-orders', HelperController.index);

routes.post('/sessions', SessionController.store);
routes.use(authMiddleware);

routes.post('/students', StudentController.store);
routes.put('/students/:id', StudentController.update);

routes.get('/plans', PlanController.index);
routes.post('/plans', PlanController.store);
routes.put('/plans/:id', PlanController.update);
routes.delete('/plans/:id', PlanController.delete);

routes.get('/registrations', RegistrationController.index);
routes.post('/registrations', RegistrationController.store);
routes.put('/registrations/:id', RegistrationController.update);
routes.delete('/registrations/:id', RegistrationController.delete);

routes.get('/answers', AnswerController.index);
routes.post('/answers/:id', AnswerController.store);

export default routes;
