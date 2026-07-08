// Single source of truth for WellCraftHub's product catalog.
// Loaded two ways from this one file:
//   - in the browser as a <script> tag, where it sets window.PRODUCTS
//   - in Netlify Functions via require(), where it sets module.exports
// Keeping both frontend and backend pointed at the same data means prices,
// names, and delivery details can never quietly drift out of sync.
//
// To add a new product later:
//   1. Add an entry below with a unique key (the "slug").
//   2. Create a Price in the Stripe Dashboard and put its ID in Netlify's
//      environment variables under the name given in `priceIdEnv`.
//   3. Copy an existing file in /products/ to products/<slug>.html and edit it.
//   4. Add a card for it in the featured grid on index.html.
// No changes to the checkout functions are required for a new one-time
// digital product; the same code path handles all of them.

const PRODUCTS = {
  'thrive-after-40-wellness-bundle': {
    image: '/images/thrive-after-40-wellness-bundle.jpg',
    name: 'Thrive After 40 Wellness Bundle',
    priceDisplay: '$47',
    priceIdEnv: 'STRIPE_PRICE_WELLNESS_BUNDLE',
    mode: 'payment',
    pageUrl: '/products/thrive-after-40-wellness-bundle.html',
    delivery: 'download',
    downloadUrl: '/downloads/thrive-after-40-wellness-bundle.zip',
    tagline: 'The complete guide, weekly planner, and Notion template, bundled together.',
  },
  'longevity-weekly-planner': {
    image: '/images/longevity-weekly-planner.jpg',
    name: 'Longevity Weekly Planner',
    priceDisplay: '$4.99',
    priceIdEnv: 'STRIPE_PRICE_LONGEVITY_PLANNER',
    mode: 'payment',
    pageUrl: '/products/longevity-weekly-planner.html',
    delivery: 'download',
    downloadUrl: '/downloads/longevity-weekly-planner.pdf',
    tagline: 'A simple standalone planner for building steady, lasting habits.',
  },
  'thrive-after-40-weekly-planner': {
    image: '/images/thrive-after-40-weekly-planner.jpg',
    name: 'Thrive After 40, Weekly Wellness Planner',
    priceDisplay: '$12.99',
    priceIdEnv: 'STRIPE_PRICE_THRIVE_WEEKLY_PLANNER',
    mode: 'payment',
    pageUrl: '/products/thrive-after-40-weekly-planner.html',
    delivery: 'download',
    downloadUrl: '/downloads/thrive-after-40-weekly-planner.pdf',
    tagline: 'A dedicated weekly planner built around the Thrive After 40 method.',
  },
  '90-day-blueprint-workbook': {
    image: '/images/90-day-blueprint-workbook.jpg',
    name: 'The 90-Day Blueprint Workbook',
    priceDisplay: '$16',
    priceIdEnv: 'STRIPE_PRICE_BLUEPRINT_WORKBOOK',
    mode: 'payment',
    pageUrl: '/products/90-day-blueprint-workbook.html',
    delivery: 'workbook',
    externalUrl: 'https://wellcrafthub.netlify.app',
    accessInstructions: [
      'Tap the workbook link above to open it.',
      'On iPhone, the workbook works best in Safari. If it opened inside another app (for example, from an email or Instagram), tap the Share icon and choose "Open in Safari".',
      'Once it is open in Safari, tap the Share icon and choose "Add to Home Screen" so you can return to it any time, like an app.',
      'Your progress is saved on your own device, so keep using the same browser and device each time you work in it.',
    ],
    tagline: 'An interactive 90-day workbook to put the Thrive After 40 plan into action.',
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PRODUCTS;
} else {
  window.PRODUCTS = PRODUCTS;
}
