import { Request, Response, Router } from 'express';
import { verifySubscription } from './verifySubscription';
import { dispatchMessage } from './dispatchMessage';

export const messengerRoutes = Router();

messengerRoutes.get('/webhook/messenger', verifySubscription);
messengerRoutes.post('/webhook/messenger', dispatchMessage);