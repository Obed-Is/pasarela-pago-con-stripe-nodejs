import express from 'express';
import { StripeController } from '../stripeController/stripe.controller.js';

const stripeWebhookRouter = express.Router();
const stripeController = new StripeController();

stripeWebhookRouter.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  (req, res) => stripeController.stripeWebhook(req, res)
);

export default stripeWebhookRouter;