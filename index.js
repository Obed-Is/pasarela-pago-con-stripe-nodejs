import express from 'express';
import morgan from 'morgan';
import path from 'node:path'
import 'dotenv/config'

import stripeRoutes from './routes/stripe.routes.js';
import pageRoutes from './routes/pages.routes.js';
import stripeWebhookRoutes from './routes/stripe.webhook.routes.js';

const app = express();
const portApp = process.env.SERVER_PORT || 4000;
const __dirname = import.meta.dirname;

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', stripeWebhookRoutes);

app.use(express.json());
app.use('/', pageRoutes);
app.use('/', stripeRoutes);

app.listen(portApp, () => {
  console.log(`App ejecutando en http://localhost:${portApp}/`)
})