// Small shared behaviors used across every page: mobile nav toggle and
// auto-filled copyright year. No framework, just plain DOM APIs.

document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var isOpen = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  var yearEls = document.querySelectorAll('[data-current-year]');
  yearEls.forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  var params = new URLSearchParams(window.location.search);
  if (params.get('checkout') === 'cancelled') {
    var banner = document.querySelector('[data-cancelled-banner]');
    if (banner) banner.hidden = false;
  }
});
