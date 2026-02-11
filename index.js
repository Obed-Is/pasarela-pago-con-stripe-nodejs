import express from 'express';
import morgan from 'morgan';
import path from 'node:path'
import 'dotenv/config'
import { StripeController } from './stripeController/stripe.controller.js';

const app = express();
const portApp = process.env.SERVER_PORT || 4000;

const __dirname = import.meta.dirname;
const stripeController = new StripeController();

app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => res.sendFile(path.join(__dirname, './views/main.html')));
app.get('/prices', (req, res) => stripeController.getPricesStripe(req, res));
app.get('/success', (req, res) => stripeController.redirectEndHook(req, res));

app.post('/create-products', (req, res) => stripeController.stripeCreateProducts(req, res));
app.post('/create-checkout-session', (req, res) => stripeController.saleInStripe(req, res));
//webhook de stripe
//con este middleware evitamos parsear el body para q la firma de stripe sea valida
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => stripeController.stripeWebhook(req, res))
app.post('/valid-payment', (req, res) => stripeController.validatePayment(req, res));

app.listen(portApp, () => {
  console.log(`App ejecutando en http://localhost:${portApp}/`)
})