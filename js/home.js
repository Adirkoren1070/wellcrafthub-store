// Renders the featured product grid on the home page from shared/products.js
// so a new product only needs a data entry, not a hand-edited grid.

var PRODUCT_ICONS = {
  'thrive-after-40-wellness-bundle':
    '<svg viewBox="0 0 48 48" fill="none" stroke-width="1.6"><rect x="10" y="18" width="28" height="20" rx="2"/><path d="M10 24h28"/><path d="M16 12h16l4 6H12z"/></svg>',
  'longevity-weekly-planner':
    '<svg viewBox="0 0 48 48" fill="none" stroke-width="1.6"><rect x="8" y="12" width="32" height="26" rx="2"/><path d="M8 20h32"/><path d="M16 8v8M32 8v8"/><path d="M14 27h4M22 27h4M30 27h4M14 32h4M22 32h4"/></svg>',
  'thrive-after-40-weekly-planner':
    '<svg viewBox="0 0 48 48" fill="none" stroke-width="1.6"><path d="M14 8h20v32H14z"/><path d="M14 8c0-1.5 1.5-3 3-3h14c1.5 0 3 1.5 3 3"/><path d="M19 17h10M19 23h10M19 29h6"/></svg>',
  '90-day-blueprint-workbook':
    '<svg viewBox="0 0 48 48" fill="none" stroke-width="1.6"><path d="M24 14c-3-3-9-3-14-2v24c5-1 11-1 14 2c3-3 9-3 14-2V12c-5-1-11-1-14 2z"/><path d="M24 14v24"/></svg>',
};

document.addEventListener('DOMContentLoaded', function () {
  var grid = document.getElementById('product-grid');
  if (!grid || typeof PRODUCTS === 'undefined') return;

  Object.keys(PRODUCTS).forEach(function (slug) {
    var product = PRODUCTS[slug];
    var icon = PRODUCT_ICONS[slug] || '';

    var card = document.createElement('a');
    card.href = product.pageUrl;
    card.className = 'product-card';
    card.innerHTML =
      '<div class="product-visual">' + icon + '</div>' +
      '<div class="product-card-body">' +
      '<h3>' + product.name + '</h3>' +
      '<p class="tagline">' + product.tagline + '</p>' +
      '<div class="product-card-price">' +
      '<span class="price-tag">' + product.priceDisplay + '</span>' +
      '<span>View details &rarr;</span>' +
      '</div></div>';

    grid.appendChild(card);
  });
});
