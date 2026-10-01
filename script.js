/* =====================================================================
   Vila Falco – malé skripty (menu, dátumy, odosielanie formulárov).
   Netreba upravovať.
   ===================================================================== */
document.addEventListener('DOMContentLoaded', function () {

  /* --- Mobilné menu --- */
  var button = document.querySelector('.menu-toggle');
  var nav = document.getElementById('hlavne-menu');
  if (button && nav) {
    var setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    button.addEventListener('click', function () {
      setOpen(button.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); button.focus(); }
    });
  }

  /* --- Dátumy v rezervácii: nedá sa vybrať minulosť, odchod je po príchode --- */
  var checkin = document.getElementById('checkin');
  var checkout = document.getElementById('checkout');
  if (checkin && checkout) {
    var toISO = function (d) { return d.toISOString().split('T')[0]; };
    var today = toISO(new Date());
    checkin.min = today;
    checkout.min = today;
    checkin.addEventListener('change', function () {
      if (!checkin.value) return;
      var next = new Date(checkin.value);
      next.setDate(next.getDate() + 1);
      checkout.min = toISO(next);
      if (checkout.value && checkout.value < checkout.min) checkout.value = '';
    });
  }

  /* --- Odoslanie formulárov cez Formspree bez opustenia stránky --- */
  document.querySelectorAll('form[data-formspree]').forEach(function (form) {
    var status = form.querySelector('.form-status');
    var submit = form.querySelector('button[type="submit"]');
    var show = function (text, type) {
      status.textContent = text;
      status.className = 'form-status is-' + type;
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.action.indexOf('VAS-FORMSPREE-ID') !== -1) {
        show(form.dataset.error, 'error');
        return;
      }
      var label = submit.textContent;
      submit.disabled = true;
      submit.textContent = 'Odosielam…';

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function (response) {
        if (response.ok) { form.reset(); show(form.dataset.success, 'success'); }
        else { show(form.dataset.error, 'error'); }
      }).catch(function () {
        show(form.dataset.error, 'error');
      }).finally(function () {
        submit.disabled = false;
        submit.textContent = label;
      });
    });
  });
});
