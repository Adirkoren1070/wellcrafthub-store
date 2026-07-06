// Kicks off Stripe Checkout for a given product slug. Requires
// shared/products.js to be loaded first (for a friendlier button state
// only; the real price and validation always happen server-side in the
// create-checkout-session function).

async function buyNow(productId, buttonEl) {
  var button = buttonEl || (window.event && window.event.currentTarget);
  var originalText = button ? button.textContent : null;

  if (button) {
    button.disabled = true;
    button.textContent = 'Redirecting to secure checkout...';
  }

  try {
    var response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: productId }),
    });

    var data = await response.json();

    if (!response.ok || !data.url) {
      throw new Error(data.error || 'Could not start checkout.');
    }

    window.location.href = data.url;
  } catch (err) {
    console.error('Checkout error:', err);
    alert(
      'Sorry, we could not start checkout just now. Please try again in a moment, ' +
      'or contact support if this keeps happening.'
    );
    if (button) {
      button.disabled = false;
      button.textContent = originalText;
    }
  }
}
