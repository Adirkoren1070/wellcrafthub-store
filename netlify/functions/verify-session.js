// Confirms a Checkout session actually succeeded before revealing any
// delivery details. The success page cannot be trusted to gate access on
// its own, since URLs can be shared or guessed, so this function is the
// real gatekeeper: it asks Stripe directly whether this session was paid.

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const PRODUCTS = require('../../shared/products');

exports.handler = async function (event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const params = event.queryStringParameters || {};
  const sessionId = params.session_id;
  const productId = params.product;
  const product = productId && PRODUCTS[productId];

  if (!sessionId || !product) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing or invalid order details.' }) };
  }

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });
  } catch (err) {
    console.error('Stripe session retrieval error:', err);
    return { statusCode: 400, body: JSON.stringify({ error: 'We could not find that order.' }) };
  }

  if (session.payment_status !== 'paid') {
    return { statusCode: 402, body: JSON.stringify({ error: 'This order has not completed payment yet.' }) };
  }

  // Make sure the session actually belongs to the product the client is
  // asking about, so a paid session for product A can't be used to read
  // out delivery details for product B.
  const expectedPriceId = process.env[product.priceIdEnv];
  const purchasedPriceId = session.line_items && session.line_items.data && session.line_items.data[0]
    ? session.line_items.data[0].price.id
    : null;

  if (expectedPriceId && purchasedPriceId && expectedPriceId !== purchasedPriceId) {
    return { statusCode: 403, body: JSON.stringify({ error: 'Order details do not match this product.' }) };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      name: product.name,
      delivery: product.delivery,
      downloadUrl: product.downloadUrl || null,
      externalUrl: product.externalUrl || null,
      accessInstructions: product.accessInstructions || null,
      customerEmail: session.customer_details ? session.customer_details.email : null,
    }),
  };
};
