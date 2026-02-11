import express from 'express';
import { StripeController } from '../stripeController/stripe.controller.js';

const router = express.Router();
const stripeController = new StripeController();

router.post('/create-products', (req, res) =>
  stripeController.stripeCreateProducts(req, res)
);

router.post('/create-checkout-session', (req, res) =>
  stripeController.saleInStripe(req, res)
);

router.post('/valid-payment', (req, res) =>
  stripeController.validatePayment(req, res)
);

router.get('/prices', (req, res) =>
  stripeController.getPricesStripe(req, res)
);

router.get('/history-payments', (req, res) =>
  stripeController.getHistoryPayments(req, res)
);

export default router;