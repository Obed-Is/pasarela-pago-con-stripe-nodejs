import express from 'express';
import path from 'node:path';
import { StripeController } from '../stripeController/stripe.controller.js';

const router = express.Router();
const __dirname = import.meta.dirname;
const stripeController = new StripeController();

router.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '../views/main.html'))
);

router.get('/history', (req, res) =>
  res.sendFile(path.join(__dirname, '../views/history.html'))
);

router.get('/success', (req, res) => 
    stripeController.redirectEndHook(req, res)
);

export default router;