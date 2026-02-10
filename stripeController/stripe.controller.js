import Stripe from "stripe";
import * as fs from 'node:fs/promises'

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
            console.log('ERROR AL CREAR LOS PRODUCTOS: ', error)
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
            console.log(error)
            // Si el archivo no existe, lo creamos
            if (error.code === 'ENOENT') {
                const dataInicial = [{ "product-exist" : false }];

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
            console.log(error);
            return res.status(500).json({ success: false, message: 'Error al obtener los productos' })
        }
    }
}