// Confirms the Stripe Checkout session server-side (never trusting the URL
// alone) and renders the right delivery content for whichever product was
// purchased. This is the one page every successful checkout lands on.

document.addEventListener('DOMContentLoaded', async function () {
  var panel = document.getElementById('state-panel');
  var params = new URLSearchParams(window.location.search);
  var sessionId = params.get('session_id');
  var productId = params.get('product');

  if (!sessionId || !productId) {
    renderError(panel, 'We could not find your order details. If you just completed a purchase, please check your email for a receipt, or contact support and we will sort it out right away.');
    return;
  }

  try {
    var response = await fetch(
      '/api/verify-session?session_id=' + encodeURIComponent(sessionId) +
      '&product=' + encodeURIComponent(productId)
    );
    var data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Payment could not be verified.');
    }

    renderSuccess(panel, data);
  } catch (err) {
    console.error('Verification error:', err);
    renderError(panel, 'We could not confirm this payment. If you were charged, please contact support with your receipt and we will make it right.');
  }
});

function renderError(panel, message) {
  panel.innerHTML =
    '<div class="check" style="background: var(--black);">!</div>' +
    '<h1>Something needs a look</h1>' +
    '<p>' + message + '</p>' +
    '<a href="/contact.html" class="btn btn-primary">Contact Support</a>';
}

function renderSuccess(panel, data) {
  var deliveryHtml = '';

  if (data.delivery === 'download' && data.downloadUrl) {
    deliveryHtml =
      '<div class="delivery-box">' +
      '<h3>Your Download</h3>' +
      '<p>Your file is ready. Save it somewhere you will remember, like a Downloads or Documents folder.</p>' +
      '<a class="btn btn-brass" href="' + data.downloadUrl + '" download>Download ' + data.name + '</a>' +
      '</div>';
  } else if (data.delivery === 'workbook' && data.externalUrl) {
    var steps = (data.accessInstructions || [])
      .map(function (step) { return '<li>' + step + '</li>'; })
      .join('');
    deliveryHtml =
      '<div class="delivery-box">' +
      '<h3>Your Workbook Link</h3>' +
      '<p><a class="btn btn-brass" href="' + data.externalUrl + '" target="_blank" rel="noopener">Open the 90-Day Blueprint Workbook</a></p>' +
      '<h3 style="margin-top: 24px;">Getting Set Up</h3>' +
      '<ol>' + steps + '</ol>' +
      '</div>';
  }

  panel.innerHTML =
    '<div class="check">&#10003;</div>' +
    '<h1>Thank you for your purchase</h1>' +
    '<p>Your payment for <strong>' + data.name + '</strong> was successful.</p>' +
    deliveryHtml +
    '<p style="font-size: 0.9rem; color: #6b7062;">' +
    (data.customerEmail ? 'A receipt was also sent to ' + data.customerEmail + '. ' : '') +
    'Keep this page open or save your receipt email, since this link is only shown once.' +
    '</p>' +
    '<p style="margin-top: 20px;"><a href="/contact.html">Need help? Contact support</a></p>';
}
