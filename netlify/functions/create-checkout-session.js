// Creates a Stripe Checkout session for one product and hands the client
// a redirect URL. All prices are looked up server-side from Stripe Price
// IDs (never trust a price sent from the browser).
//
// This same function shape works for both one-time payments (today's
// products) and future subscriptions: a product's `mode` field controls
// whether Stripe creates a one-time payment or a recurring subscription,
// so adding a subscription product later does not require a new endpoint.

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const PRODUCTS = require('../../shared/products');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let productId;
  try {
    ({ productId } = JSON.parse(event.body || '{}'));
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  const product = productId && PRODUCTS[productId];
  if (!product) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Unknown product' }) };
  }

  const priceId = process.env[product.priceIdEnv];
  if (!priceId) {
    console.error('Missing Stripe price ID env var:', product.priceIdEnv);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'This product is not set up for checkout yet. Please contact support.' }),
    };
  }

  const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || 'http://localhost:8888';
  const mode = product.mode || 'payment';

  const sessionParams = {
    mode: mode,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/success.html?product=${encodeURIComponent(productId)}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}${product.pageUrl}?checkout=cancelled`,
    allow_promotion_codes: true,
  };

  // Creating a Stripe Customer even for guest, one-time purchases means
  // returning buyers are already recognizable in Stripe once accounts and
  // subscriptions are introduced, without needing to backfill anything.
  if (mode === 'payment') {
    sessionParams.customer_creation = 'always';
  }

  try {
    const session = await stripe.checkout.sessions.create(sessionParams);
    return { statusCode: 200, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    console.error('Stripe checkout session error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not start checkout. Please try again shortly.' }),
    };
  }
};
