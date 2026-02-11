# Pasarela de Pago con Stripe

Una pasarela de pago implementada con Stripe, que gestiona el ciclo completo de transacciones desde la creacion de productos hasta la verificacion de pagos mediante webhooks.

## Caracteristicas

- **Creacion de productos en Stripe**: Gestion automatica de productos y precios
- **Pasarela de pago integrada**: Checkout seguro con Stripe
- **Webhooks implementados**: Recepcion y procesamiento de eventos de Stripe
- **Verificacion de pagos**: Validacion de transacciones completadas
- **Historial de pagos**: Consulta y visualizacion de transacciones
- **API REST completa**: Endpoints bien estructurados para toda la funcionalidad

## Stack Tecnologico

- **Backend**: Node.js con Express
- **Pagos**: Stripe API
- **Frontend**: HTML5, CSS3, JavaScript Vanilla
- **UI/UX**: Modo oscuro
- **Alertas**: SweetAlert2 para notificaciones

## Estructura del Proyecto

```
pasarela-de-pago-stripe/
├── public/
│   └── history.js    # Logica del historial de pagos
│   └── main.js       # Logica de la pagina principal de planes
├── routes/
│   └── pages.routes.js    # Endpoints para el manejo de las vistas
│   └── stripe.routes.js            # Endpoints para manejo de logica de Stripe
│   └── stripe.webhook.routes.js            # Endpoints para manejo de webhook
├── stripeController/
│   └── stripe.controller.js    # Logica de Stripe y webhooks
├── views/
│   ├── main.html              # Pagina principal con planes
│   └── history.html           # Historial de pagos
├── index.js                  # Servidor Express y rutas
├── base-stripe.json          # Base de datos local de pagos
└── README.md                 
```

## Endpoints de la API

### Metodos GET
- `GET /` - Pagina principal con planes de pago
- `GET /history` - Pagina de historial de pagos
- `GET /success` - Pagina de exito de pago
- `GET /prices` - Obtener precios de productos en Stripe
- `GET /history-payments` - Obtener historial de pagos

### Metodos POST
- `POST /create-products` - Crear productos en Stripe
- `POST /create-checkout-session` - Iniciar sesion de pago
- `POST /webhook` - Recibir webhooks de Stripe
- `POST /valid-payment` - Validar estado de un pago

## Flujo de Pago

1. **Carga de productos**: La aplicacion verifica si existen productos en Stripe
2. **Creacion automatica**: Si no hay productos, los crea automaticamente
3. **Seleccion de plan**: Usuario elige un plan (Basico, Estandar, Premium, Business)
4. **Proceso de pago**: Redireccion a Checkout de Stripe
5. **Webhook**: Stripe notifica el estado del pago
6. **Verificacion**: La aplicacion verifica y confirma el pago
7. **Historial**: El pago se registra en el historial

## Gestion de Webhooks

La aplicacion implementa webhooks para recibir eventos en tiempo real:

- **payment_intent.succeeded**: Pago completado exitosamente

## Gestion de Datos

- **Base local**: Archivo `base-stripe.json` para almacenamiento
- Se utiliza para evitar reprocesar pagos duplicados enviados por Stripe y gestionar el historial

## Instalacion y Ejecucion

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/Obed-Is/pasarela-pago-con-stripe-nodejs.git
   cd pasarela-pago-con-stripe-nodejs
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
- Para obtener la STRIPE_SECRET_KEY debes crear una cuenta en Stripe y obtenerla desde la consola de Stripe.
- Para obtener la STRIPE_WEBHOOK_SECRET luego de crear tu cuenta abre una terminal y ejecuta el siguiente comando.
   ```bash
   stripe login
   ```
- Luego de iniciar sesion, ejecuta el siguiente comando y obtendras en la consola la STRIPE_WEBHOOK_SECRET.
> El comando `stripe listen` se utiliza únicamente en entorno de desarrollo.
   ```bash
   npm run stripe-listen
   ```
- Posteriormente crea un archivo .env y agrega las siguientes variables siguiendo el siguiente formato.
   ```bash
   # Crear archivo .env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   SERVER_PORT=3000
   ```

4. **Iniciar servidor**:
   ```bash
   npm start
   ```

5. **Acceder a la aplicacion**:
   ```
   http://localhost:3000
   ```

## Ciclo de Vida del Pago

1. **Producto creado** → 2. **Precio asignado** → 3. **Checkout iniciado** → 4. **Pago procesado** → 5. **Webhook recibido** → 6. **Pago verificado** → 7. **Historial actualizado**

## Licencia

Este proyecto es para fines practicos y de demostracion de la integracion con Stripe.

---

**Integracion completa con Stripe para pagos seguros y profesionales**