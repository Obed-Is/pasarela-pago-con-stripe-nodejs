document.addEventListener('DOMContentLoaded', loadPaymentHistory);

async function loadPaymentHistory() {
  try {
    const response = await fetch('/history-payments');
    const data = await response.json();
    console.log(data)

    document.getElementById('loading').style.display = 'none';

    if (!data.success || !data.data || data.data.length === 0) {
      document.getElementById('empty-state').style.display = 'block';
      return;
    }

    displayPaymentHistory(data.data);
  } catch (error) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('empty-state').style.display = 'block';
    
    Swal.fire({
      title: 'Error',
      text: 'No se pudo cargar el historial de pagos. Intenta nuevamente.',
      icon: 'error',
      confirmButtonText: 'Entendido'
    });
  }
}

function displayPaymentHistory(payments) {
  const historyGrid = document.getElementById('history-grid');
  
  payments.forEach(payment => {
    const paymentElement = createPaymentElement(payment);
    historyGrid.appendChild(paymentElement);
  });

  historyGrid.style.display = 'grid';
}

function createPaymentElement(payment) {
  const div = document.createElement('div');
  div.className = 'history-item';

  const statusClass = getStatusClass(payment.state);
  const statusText = getStatusText(payment.state);

  div.innerHTML = `
    <div class="history-header">
      <span class="payment-id">${payment.idPayment || payment.id || 'N/A'}</span>
      <span class="payment-amount">$${payment.amount || '0'}</span>
    </div>
    <div class="payment-details">
      <div class="detail-item">
        <span class="detail-label">ID Transacción</span>
        <span class="detail-value">${payment.id || 'N/A'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Monto</span>
        <span class="detail-value">$${payment.amount || '0'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Estado</span>
        <span class="status-badge ${statusClass}">${statusText}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Fecha Vencimiento</span>
        <span class="detail-value">${payment.dateExpired || 'N/A'}</span>
      </div>
    </div>
  `;

  return div;
}

function getStatusClass(status) {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'succeeded':
      return 'status-success';
    case 'pending':
    case 'processing':
      return 'status-pending';
    case 'failed':
    case 'cancelled':
      return 'status-failed';
    default:
      return 'status-pending';
  }
}

function getStatusText(status) {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'succeeded':
      return 'Completado';
    case 'pending':
    case 'processing':
      return 'Pendiente';
    case 'failed':
    case 'cancelled':
      return 'Fallido';
    default:
      return 'Desconocido';
  }
}
