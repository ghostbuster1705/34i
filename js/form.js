/**
 * Lead form handling with DSGVO consent validation.
 */
(function () {
  'use strict';

  function getConfig() {
    return window.BAUFI_CONFIG || {};
  }

  function validateForm(form) {
    const errors = [];
    const vorname = form.vorname.value.trim();
    const nachname = form.nachname.value.trim();
    const telefon = form.telefon.value.trim();
    const email = form.email.value.trim();
    const consent = form.consent.checked;

    if (!vorname) errors.push('Bitte geben Sie Ihren Vornamen ein.');
    if (!nachname) errors.push('Bitte geben Sie Ihren Nachnamen ein.');
    if (!telefon || telefon.length < 6)
      errors.push('Bitte geben Sie eine gültige Telefonnummer ein.');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.push('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
    if (!consent)
      errors.push('Bitte stimmen Sie der Datenschutzerklärung zu.');

    return errors;
  }

  function buildPayload(form) {
    const calc = window.__calcSnapshot || {};
    return {
      vorname: form.vorname.value.trim(),
      nachname: form.nachname.value.trim(),
      telefon: form.telefon.value.trim(),
      email: form.email.value.trim(),
      plz: form.plz?.value.trim() || '',
      nachricht: form.nachricht?.value.trim() || '',
      quelle: 'Landingpage Baufinanzierung Berlin',
      berechnung: calc,
      submittedAt: new Date().toISOString(),
    };
  }

  async function submitLead(payload) {
    const config = getConfig();
    const endpoint = config.formEndpoint;

    if (endpoint) {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Übermittlung fehlgeschlagen');
      return;
    }

    // Fallback: store locally + open mailto
    const leads = JSON.parse(localStorage.getItem('baufi_leads') || '[]');
    leads.push(payload);
    localStorage.setItem('baufi_leads', JSON.stringify(leads));

    const subject = encodeURIComponent(
      'Neue Baufinanzierungsanfrage — ' + payload.vorname + ' ' + payload.nachname
    );
    const body = encodeURIComponent(
      [
        'Neue Anfrage über die Landingpage',
        '',
        'Name: ' + payload.vorname + ' ' + payload.nachname,
        'Telefon: ' + payload.telefon,
        'E-Mail: ' + payload.email,
        'PLZ: ' + (payload.plz || '—'),
        'Nachricht: ' + (payload.nachricht || '—'),
        '',
        '--- Berechnung ---',
        'Kaufpreis: ' + (payload.berechnung.kaufpreis || '—') + ' €',
        'Darlehen: ' + (payload.berechnung.darlehen || '—') + ' €',
        'Monatsrate: ' + (payload.berechnung.monatsrate || '—') + ' €',
        'Zins: ' + (payload.berechnung.zins || '—') + ' %',
        'Tilgung: ' + (payload.berechnung.tilgung || '—') + ' %',
      ].join('\n')
    );

    const email = config.contactEmail || 'kontakt@example.de';
    window.location.href = 'mailto:' + email + '?subject=' + subject + '&body=' + body;
  }

  function showSuccess(form) {
    form.style.display = 'none';
    document.getElementById('form-success')?.classList.add('visible');
  }

  function showError(msg) {
    const el = document.getElementById('form-error');
    if (el) {
      el.textContent = msg;
      el.classList.add('visible');
    }
  }

  function hideError() {
    document.getElementById('form-error')?.classList.remove('visible');
  }

  function init() {
    const form = document.getElementById('lead-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideError();

      const errors = validateForm(form);
      if (errors.length) {
        showError(errors[0]);
        return;
      }

      const btn = form.querySelector('[type="submit"]');
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Wird gesendet…';

      try {
        const payload = buildPayload(form);
        await submitLead(payload);
        showSuccess(form);

        // Analytics hook (optional)
        if (typeof gtag === 'function') {
          gtag('event', 'generate_lead', { event_category: 'baufi' });
        }
      } catch (err) {
        showError(
          'Die Anfrage konnte nicht gesendet werden. Bitte rufen Sie uns direkt an.'
        );
        btn.disabled = false;
        btn.textContent = originalText;
      }
    });

    // FAQ accordion
    document.querySelectorAll('.faq-question').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const wasOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach((i) => i.classList.remove('open'));
        if (!wasOpen) item.classList.add('open');
      });
    });

    // Mobile menu
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    toggle?.addEventListener('click', () => nav?.classList.toggle('open'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
