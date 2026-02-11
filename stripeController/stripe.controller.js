import Stripe from "stripe";
import * as fs from 'node:fs/promises'
import { randomUUID } from "node:crypto";

const keyStripe = process.env.STRIPE_KEY_TEST_SECRET;

export class StripeController {
    #listProducts;

    constructor() {
        this.stripe = new Stripe(keyStripe)
        //el precio se coloca en centavos es decir $9 = 900 centavos por metrica de stripe
        this.#listProducts = [{
            nombre: 'Plan basico',
            descripcion: 'Plan para 1 usuario con acciones limitadas',
            precio: 900
        }, {
            nombre: 'Plan estandar',
            descripcion: 'Plan para 3 usuarios con contenido HD',
            precio: 1900
        }, {
            nombre: 'Plan premium',
            descripcion: 'Plan para 10 usuarios con reportes avanzados',
            precio: 2900
        }, {
            nombre: 'Plan business',
            descripcion: 'Plan con usuarios ilimitados y con cuenta de generente',
            precio: 4900
        }]
    }

    async stripeCreateProducts(req, res) {
        const data = await this.#validateProductCreate();

        if (data[0]["product-exist"]) {
            return res.status(409).json({ success: false, message: 'Los productos ya han sido creados' });
        }

        try {
            for (const producto of this.#listProducts) {
                const productStripe = await this.stripe.products.create({
                    name: producto.nombre,
                    description: producto.descripcion,
                })
                await this.stripe.prices.create({
                    product: productStripe.id,
                    unit_amount: producto.precio,
                    currency: 'USD',
                    nickname: producto.nombre
                })
            }
            data[0]["product-exist"] = true;
            await fs.writeFile('base-stripe.json', JSON.stringify(data, null, 2))

            return res.status(200).json({ success: true, message: 'Productos creados' })
        } catch (error) {
            return res.status(409).json({ success: false, message: 'Ocurrio un error al crear los productos' })
        }
    }

    //esto valida si los productos ya estan creados o no al iniciar el proyecto por primera vez
    async #validateProductCreate() {
        try {
            ////////// NOTA ///////////
            ///////// Si los productos se borran manualmente en stripe /////////
            //////// se debe cambiar el valor de product-exist a falso en el json /////////
            const archivo = JSON.parse(await fs.readFile('base-stripe.json', 'utf8'));

            return archivo;
        } catch (error) {
            // Si el archivo no existe, lo creamos
            if (error.code === 'ENOENT') {
                const dataInicial = [{ "product-exist": false }];

                await fs.writeFile(
                    'base-stripe.json',
                    JSON.stringify(dataInicial, null, 2)
                );

                return dataInicial;
            }
            return false;
        }
    }

    async getPricesStripe(req, res) {
        try {
            const pricesStripe = await this.stripe.prices.list({
                active: true
            });

            if (pricesStripe.data.length === 0) {
                return res.status(200).json({ success: true, message: 'No hay precios activos' });
            }

            const formatPrices = [];

            for (const product of pricesStripe.data) {
                formatPrices.push({
                    producto: product.nickname,
                    precio_id: product.id
                })
            }

            return res.status(200).json({ success: true, prices: formatPrices })
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Error al obtener los productos' })
        }
    }

    async saleInStripe(req, res) {
        const priceId = req.body.price_id;
        if (!priceId.startsWith('price_')) {
            return res.status(404).redirect('/?success=false');
        }

        try {
            const session = await this.stripe.checkout.sessions.create({
                line_items: [
                    {
                        price: priceId,
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: 'http://localhost:3000/success',
                cancel_url: 'http://localhost:3000/'
            });

            res.redirect(session.url);
        } catch (error) {
            // posible caso de q el id del producto sea invalido o alterado
            // entonces solo se le redirije sin dar mas informacion por ahora
            res.redirect('/')
        }
    }

    //configuracion del webhook de stripe
    async stripeWebhook(req, res) {
        //firma que envia stripe para validar el proceso
        const sig = req.headers['stripe-signature'];
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

        let event;
        try {
            //aqui se verifica que la firma del webhook sea valida
            event = this.stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        } catch (err) {
            return res.status(400).json({ success: false, message: 'Error al verificar el webhook' });
        }

        if (event.type === 'payment_intent.succeeded') {
            // cuando todos los procesos han sido aprobados pasa a guardar el registro en local
            this.handlePaymentSucceeded(event.data.object);
        }

        return res.status(200).json({ success: true, message: 'Pago realizado con exito' });
    }

    //esto se usa para verificar si ya existe el payment ya q stripe puede lanzar diferentes llamadas al webhook
    //por problemas de red o perdidas.
    async handlePaymentSucceeded(paymentIntent) {
        const dataFile = await JSON.parse(await fs.readFile('base-stripe.json', 'utf8'));
        const existing = dataFile.find((payment) => payment.idPayment === paymentIntent.id)

        if (existing) {
            /// Si ya existe el paymentIntent.id en el json 
            // significa q ya se proceso y guardo entonces solo salimos de la funcion 
            (`Payment ${paymentIntent.id} ya esta procesado`);
            return;
        }

        // cuando el proceso se completa por primera vez guardanis su ID para mantener un registro
        // 
        const UUID = randomUUID();
        const fechaActual = new Date();
        fechaActual.setMonth(fechaActual.getMonth() + 1);

        const newDataPayment = {
            id: UUID,
            idPayment: paymentIntent.id,
            amount: paymentIntent.amount.toFixed(2),
            state: paymentIntent.status,
            customer: paymentIntent.customer,
            dateExpired: fechaActual.toISOString().split('T')[0]
        }

        dataFile.push(newDataPayment);
        await fs.writeFile('base-stripe.json', JSON.stringify(dataFile, null, 2), 'utf8');
        return;
    }

    async redirectEndHook(req, res) {
        try {
            const dataFile = JSON.parse(await fs.readFile('base-stripe.json', 'utf8'));
            //aqui ya q solo es entorno local se llama al ultimo indice q es la transaccion mas reciente
            //caso contrario se llamaria con el id del usuario o identificador y se procesaria la solicitud
            const dataPayment = dataFile.at(-1);
            if (dataPayment.state !== 'succeeded') return res.redirect(`/?id-payment=${0}&?status=false`);

            return res.redirect(`/?id-payment=${dataPayment.idPayment}&status=true`)
        } catch (error) {
            return res.redirect(`/?id-payment=${0}&?status=false`);
        }
    }

    async validatePayment(req, res) {
        const idPaymentBody = req.body.idPayment;
        if (!idPaymentBody) return res.status(400).json({ success: false, message: 'Identificador invalido' });

        const dataFile = JSON.parse(await fs.readFile('base-stripe.json', 'utf8'));
        const dataPayment = dataFile.find((payment) => payment.idPayment === idPaymentBody)
        if (!dataPayment) return res.status(404).json({ success: false, message: 'Registro no encontrado' });

        if (dataPayment.state === 'succeeded') {
            return res.status(200).json({ success: true })
        }

        return res.status(200).json({ success: false })
    }

    async getHistoryPayments(req, res) {
        try {
            const dataFile = JSON.parse(await fs.readFile('base-stripe.json', 'utf8'));
            dataFile.splice(0, 1)
            return res.status(200).json({ success: true, data: dataFile })
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Error al obtener el historial de pagos' });
        }
    }
}
