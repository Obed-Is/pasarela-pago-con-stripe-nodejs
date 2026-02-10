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

    //esto valida si los productos ya estan creados o no
    async #validateProductCreate() {
        try {
            const archivo = JSON.parse(await fs.readFile('base-stripe.json', 'utf8'));

            return archivo;
        } catch (error) {
            console.log(error)
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
}

// const as = new StripeController();
// console.log(await as.validateProductCreate())