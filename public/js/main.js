//obtiene los id de cada plan para los precios en caso contrario manda una alerta para agregarlos
getPrices()
detectedQueryString()

async function getPrices() {
  try {
    const response = await fetch('http://localhost:3000/prices', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();

    if (!data.prices || data.prices.length === 0) {
      return Swal.fire({
        title: '¡Sin productos en STRIPE!',
        text: 'No se han agregado los productos a stripe correctamente, verifica que los planes esten completos en la plataforma',
        icon: 'error',

        showCancelButton: true,
        confirmButtonText: "Agregar productos",
        cancelButtonText: "Los agregare mas tarde",

        allowOutsideClick: () => !Swal.isLoading(),
        allowOutsideClick: false,
        allowEscapeKey: false,
        showCloseButton: false,
      }).then(async (result) => {
        if (result.isConfirmed) {

          Swal.fire({
            title: 'Creando productos...',
            text: 'Por favor espera',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });

          await createProducts();

          Swal.close();
        }
      })
    }
    const priceBasic = document.getElementById('price_basic');
    const priceStandar = document.getElementById('price_standard');
    const pricePremiun = document.getElementById('price_premium');
    const priceBusiness = document.getElementById('price_business');

    priceBasic.value = data.prices[3].precio_id;
    priceStandar.value = data.prices[2].precio_id;
    pricePremiun.value = data.prices[1].precio_id;
    priceBusiness.value = data.prices[0].precio_id;

    return;
  } catch (error) {
    return Swal.fire({
      title: 'Error con STRIPE',
      text: 'Ocurrio un error al intentar obtener los precios de los productos en STRIPE',
      icon: 'error'
    })
  }
}

async function createProducts() {
  try {
    const response = await fetch('http://localhost:3000/create-products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!data.success) {
      return Swal.fire({
        title: 'Error con STRIPE',
        text: data.message,
        icon: 'error'
      })
    }

    await getPrices();
    return Swal.fire({
      icon: 'success',
      title: 'Productos creados',
      text: 'Los productos fueron creados correctamente'
    });
  } catch (error) {
    return Swal.fire({
      title: 'Error con STRIPE',
      text: 'Ocurrio un error al intentar crear los productos en STRIPE',
      icon: 'error'
    })
  }
}

async function detectedQueryString() {
  let url = new URLSearchParams(window.location.search);
  const idPayment = url.get('id-payment');

  if (!idPayment) return;

  try {
    const response = await fetch(`http://localhost:3000/valid-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ idPayment })
    });

    const data = await response.json();

    if (data.success) {
      return Swal.fire({
        title: '¡Compra exitosa!',
        text: `La compra del plan fue exitosa, puede comprobar el historial de compra o seguir adquiriendo planes de forma practica`,
        icon: 'success'
      }).then(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
      });
    }

    return Swal.fire({
      title: 'Pago no completado',
      text: 'El pago no pudo confirmarse. Si el problema persiste, verifica tu método de pago o contacta a soporte.',
      icon: 'warning'
    }).then(() => {
      window.history.replaceState({}, document.title, window.location.pathname);
    });

  } catch (error) {
    return Swal.fire({
      title: 'Pago no completado',
      text: 'El pago no pudo confirmarse. Si el problema persiste, verifica tu método de pago o contacta a soporte.',
      icon: 'warning'
    }).then(() => {
      window.history.replaceState({}, document.title, window.location.pathname);
    });

  }
}
