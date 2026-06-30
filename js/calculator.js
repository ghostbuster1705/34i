/**
 * Annuitätendarlehen calculator for Baufinanzierung landing page.
 */
(function () {
  'use strict';

  const fmt = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  });

  const fmtDec = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  });

  const numFmt = new Intl.NumberFormat('de-DE');

  function parseNum(value) {
    if (typeof value === 'number') return value;
    return parseFloat(String(value).replace(/\./g, '').replace(',', '.')) || 0;
  }

  function formatYears(months) {
    const years = Math.floor(months / 12);
    const rest = months % 12;
    if (rest === 0) return `${years} Jahre`;
    return `${years} J. ${rest} Mon.`;
  }

  /**
   * Calculate annuity loan: monthly rate, term, total interest.
   */
  function calculateLoan({
    darlehen,
    zinsPercent,
    tilgungPercent,
  }) {
    if (darlehen <= 0) {
      return { rate: 0, months: 0, totalInterest: 0, totalPayment: 0 };
    }

    const monthlyZins = zinsPercent / 100 / 12;
    const monthlyTilgung = tilgungPercent / 100 / 12;
    const rate = darlehen * (monthlyZins + monthlyTilgung);

    if (rate <= 0) {
      return { rate: 0, months: 0, totalInterest: 0, totalPayment: 0 };
    }

    let rest = darlehen;
    let months = 0;
    let totalInterest = 0;
    const maxMonths = 50 * 12;

    while (rest > 0.5 && months < maxMonths) {
      const interest = rest * monthlyZins;
      const principal = rate - interest;
      totalInterest += interest;
      rest -= principal;
      months += 1;
    }

    return {
      rate,
      months,
      totalInterest,
      totalPayment: darlehen + totalInterest,
    };
  }

  function getInputs() {
    const kaufpreis = parseNum(document.getElementById('kaufpreis')?.value);
    const nebenkosten = parseNum(document.getElementById('nebenkosten')?.value);
    const eigenkapital = parseNum(document.getElementById('eigenkapital')?.value);
    const zins = parseNum(document.getElementById('zins')?.value);
    const tilgung = parseNum(document.getElementById('tilgung')?.value);

    const nebenkostenBetrag = kaufpreis * (nebenkosten / 100);
    const gesamtkosten = kaufpreis + nebenkostenBetrag;
    const darlehen = Math.max(0, gesamtkosten - eigenkapital);

    return {
      kaufpreis,
      nebenkosten,
      nebenkostenBetrag,
      gesamtkosten,
      eigenkapital,
      darlehen,
      zins,
      tilgung,
    };
  }

  function updateSliders() {
    const zinsSlider = document.getElementById('zins-slider');
    const zinsInput = document.getElementById('zins');
    const tilgungSlider = document.getElementById('tilgung-slider');
    const tilgungInput = document.getElementById('tilgung');

    if (zinsSlider && zinsInput) {
      zinsInput.value = parseFloat(zinsSlider.value).toFixed(2);
      document.getElementById('zins-display').textContent =
        parseFloat(zinsSlider.value).toFixed(2) + ' %';
    }

    if (tilgungSlider && tilgungInput) {
      tilgungInput.value = parseFloat(tilgungSlider.value).toFixed(2);
      document.getElementById('tilgung-display').textContent =
        parseFloat(tilgungSlider.value).toFixed(2) + ' %';
    }
  }

  function renderResults() {
    const inputs = getInputs();
    const loan = calculateLoan({
      darlehen: inputs.darlehen,
      zinsPercent: inputs.zins,
      tilgungPercent: inputs.tilgung,
    });

    const resultsEl = document.getElementById('calc-results');
    const leadSection = document.getElementById('lead-section');

    if (!resultsEl) return;

    document.getElementById('result-rate').textContent = fmtDec.format(loan.rate);
    document.getElementById('result-darlehen').textContent = fmt.format(inputs.darlehen);
    document.getElementById('result-laufzeit').textContent = formatYears(loan.months);
    document.getElementById('result-zinsen').textContent = fmt.format(loan.totalInterest);
    document.getElementById('result-gesamt').textContent = fmt.format(inputs.gesamtkosten);
    document.getElementById('result-ek-quote').textContent =
      inputs.gesamtkosten > 0
        ? ((inputs.eigenkapital / inputs.gesamtkosten) * 100).toFixed(1) + ' %'
        : '—';

    resultsEl.classList.add('visible');
    leadSection?.classList.add('visible');

    // Store for form submission
    window.__calcSnapshot = {
      ...inputs,
      monatsrate: Math.round(loan.rate * 100) / 100,
      laufzeitMonate: loan.months,
      gesamtzinsen: Math.round(loan.totalInterest),
      timestamp: new Date().toISOString(),
    };
  }

  function bindEvents() {
    const calcForm = document.getElementById('calc-form');
    const inputs = calcForm?.querySelectorAll('input, select');

    inputs?.forEach((el) => {
      el.addEventListener('input', () => {
        updateSliders();
        renderResults();
      });
      el.addEventListener('change', renderResults);
    });

    document.getElementById('zins-slider')?.addEventListener('input', () => {
      updateSliders();
      renderResults();
    });

    document.getElementById('tilgung-slider')?.addEventListener('input', () => {
      updateSliders();
      renderResults();
    });

    calcForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      renderResults();
      document.getElementById('lead-section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    });

    // Format number inputs on blur
    ['kaufpreis', 'eigenkapital'].forEach((id) => {
      const el = document.getElementById(id);
      el?.addEventListener('blur', () => {
        const val = parseNum(el.value);
        if (val > 0) el.value = numFmt.format(val);
      });
      el?.addEventListener('focus', () => {
        el.value = String(parseNum(el.value) || '');
      });
    });
  }

  function init() {
    updateSliders();
    bindEvents();
    renderResults();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
