import express from 'express';
import morgan from 'morgan';
import path from 'node:path'
import 'dotenv/config'
import { StripeController } from './stripeController/stripe.controller.js';

const app = express();
const portApp = process.env.SERVER_PORT || 4000;

const __dirname = import.meta.dirname;
const stripeController = new StripeController();

app.use(morgan('dev'));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, './views/main.html')));
app.get('/prices', (req, res) => stripeController.getPricesStripe(req, res));

app.post('/create-products', (req, res) => stripeController.stripeCreateProducts(req, res));

app.listen(portApp, () => {
    console.log(`App ejecutando en http://localhost:${portApp}/`)
})