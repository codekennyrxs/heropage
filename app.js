/* Kahvi POS landing — scroll reveal + sticky-header elevation */
(function () {
  'use strict';

  /* ---- scroll-reveal for .rv elements ---- */
  var els = document.querySelectorAll('.rv');
  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  if (!('IntersectionObserver' in window) || reduce) {
    els.forEach(function (e) { e.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    els.forEach(function (e, i) {
      // slight stagger within a group by delaying the transition
      e.style.transitionDelay = (Math.min(i % 4, 3) * 70) + 'ms';
      io.observe(e);
    });
  }

  /* ---- elevate the sticky header once the page scrolls ---- */
  var topbar = document.querySelector('.topbar');
  if (topbar) {
    var onScroll = function () {
      topbar.classList.toggle('scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
})();

/* ---- interactive POS demo in the hero phone ---- */
(function () {
  'use strict';
  var menuEl = document.getElementById('posMenu');
  var cartEl = document.getElementById('posCart');
  var totalsEl = document.getElementById('posTotals');
  var chargeBtn = document.getElementById('posCharge');
  var chargeLbl = document.getElementById('posChargeLbl');
  var bodyEl = document.getElementById('posBody');
  var paidEl = document.getElementById('posPaid');
  var receiptEl = document.getElementById('posReceipt');
  var newBtn = document.getElementById('posNew');
  var floatEl = document.getElementById('posFloatReceipt');
  if (!menuEl || !cartEl || !chargeBtn) return; // markup not present

  // dummy catalog — sample Filipino sari-sari / snack items
  var CATALOG = [
    { id: 'bb', n: 'Boy Bawang Garlic', r: 'Boy Bawang', p: 20, g: '#e0a53a,#b06a12', l: 'B' },
    { id: 'pt', n: 'Piattos Cheese',    r: 'Piattos',    p: 27, g: '#d94f4f,#a11f1f', l: 'P' },
    { id: 'cn', n: 'Choc Nut 24s',      r: 'Choc Nut',   p: 55, g: '#7a5230,#4a2f18', l: 'C' },
    { id: 'sf', n: 'Sky Flakes 10s',    r: 'Sky Flakes', p: 44, g: '#2f8fb0,#155b74', l: 'S' },
    { id: 'nv', n: 'Nova Cheddar',      r: 'Nova',       p: 16, g: '#4f8f2f,#2b6014', l: 'N' },
    { id: 'ch', n: 'Chippy BBQ',        r: 'Chippy',     p: 13, g: '#c97b2b,#8a4f12', l: 'C' }
  ];
  var BY_ID = {};
  CATALOG.forEach(function (it) { BY_ID[it.id] = it; });

  // cart starts with a sample sale so the demo looks alive on load
  var cart = { bb: 3, pt: 2, cn: 1 };

  function peso(n) { return '₱' + Math.round(n).toLocaleString('en-US'); }
  function grad(g) { return 'linear-gradient(140deg,' + g + ')'; }
  function subtotal() {
    return Object.keys(cart).reduce(function (s, id) { return s + BY_ID[id].p * cart[id]; }, 0);
  }
  function discount(sub) { return sub >= 150 ? Math.round(sub * 0.05) : 0; }

  function renderMenu() {
    menuEl.innerHTML = CATALOG.map(function (it) {
      return '<button class="menu-item" type="button" data-id="' + it.id +
        '" aria-label="Add ' + it.n + ', ' + peso(it.p) + '">' +
        '<span class="mi-th" style="background:' + grad(it.g) + '">' + it.l + '</span>' +
        '<span class="mi-tx"><b>' + it.r + '</b><small>' + peso(it.p) + '</small></span></button>';
    }).join('');
  }

  function renderCart() {
    var ids = Object.keys(cart);
    if (!ids.length) {
      cartEl.innerHTML = '<div class="cart-empty">Wala pang laman — tap an item sa taas to start a sale.</div>';
      return;
    }
    cartEl.innerHTML = ids.map(function (id) {
      var it = BY_ID[id], q = cart[id];
      return '<div class="cart-line">' +
        '<span class="thumb" style="background:' + grad(it.g) + '">' + it.l + '</span>' +
        '<span class="nm"><b>' + it.r + '</b><small>' + peso(it.p) + ' each</small></span>' +
        '<span class="step">' +
          '<button type="button" data-act="dec" data-id="' + id + '" aria-label="Bawasan ang ' + it.r + '">−</button>' +
          '<b>' + q + '</b>' +
          '<button type="button" data-act="inc" data-id="' + id + '" aria-label="Dagdagan ang ' + it.r + '">+</button>' +
        '</span>' +
        '<span class="amt">' + peso(it.p * q) + '</span></div>';
    }).join('');
  }

  function renderTotals() {
    var sub = subtotal(), disc = discount(sub), tot = sub - disc;
    var rows = '<div class="r"><span>Subtotal</span><span>' + peso(sub) + '</span></div>';
    if (disc > 0) rows += '<div class="r"><span>Suki discount (5%)</span><span>−' + peso(disc) + '</span></div>';
    rows += '<div class="r grand"><span>Total</span><b>' + peso(tot) + '</b></div>';
    totalsEl.innerHTML = rows;
    return tot;
  }

  function renderFloat() {
    if (!floatEl) return;
    var ids = Object.keys(cart), sub = subtotal(), tot = sub - discount(sub);
    var lines = ids.length
      ? ids.map(function (id) {
          return '<div class="rl"><span>' + BY_ID[id].r + ' ×' + cart[id] + '</span><b>' + peso(BY_ID[id].p * cart[id]) + '</b></div>';
        }).join('')
      : '<div class="rl"><span>No items yet</span><b>₱0</b></div>';
    floatEl.innerHTML =
      '<h4><svg><use href="#i-receipt"/></svg> SALES RECEIPT</h4>' +
      '<div style="font-size:.66rem;color:var(--muted)">Aling Nena\'s Snack Haus</div>' +
      '<div class="dot"></div>' + lines + '<div class="dot"></div>' +
      '<div class="rl"><span>Total</span><b>' + peso(tot) + '</b></div>' +
      '<div class="stamp"><svg><use href="#i-checkc"/></svg> Live preview</div>';
  }

  function refresh() {
    renderCart();
    var tot = renderTotals();
    renderFloat();
    var empty = !Object.keys(cart).length;
    chargeBtn.disabled = empty;
    chargeLbl.textContent = empty ? 'Add items to charge' : 'Charge ' + peso(tot);
  }

  function add(id) { cart[id] = (cart[id] || 0) + 1; refresh(); }
  function step(id, d) {
    cart[id] = (cart[id] || 0) + d;
    if (cart[id] <= 0) delete cart[id];
    refresh();
  }

  menuEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-id]');
    if (b) add(b.getAttribute('data-id'));
  });
  cartEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (b) step(b.getAttribute('data-id'), b.getAttribute('data-act') === 'inc' ? 1 : -1);
  });

  chargeBtn.addEventListener('click', function () {
    if (chargeBtn.disabled) return;
    var ids = Object.keys(cart), sub = subtotal(), disc = discount(sub), tot = sub - disc;
    var rows = ids.map(function (id) {
      return '<div class="rl"><span>' + BY_ID[id].r + ' ×' + cart[id] + '</span><b>' + peso(BY_ID[id].p * cart[id]) + '</b></div>';
    }).join('');
    if (disc > 0) rows += '<div class="rl"><span>Suki discount</span><b>−' + peso(disc) + '</b></div>';
    rows += '<div class="rl tot"><span>Total paid</span><b>' + peso(tot) + '</b></div>';
    receiptEl.innerHTML = rows;
    // overlay sits on top of the (still in-flow) body so the screen keeps its height
    paidEl.hidden = false;
  });

  newBtn.addEventListener('click', function () {
    cart = {};
    paidEl.hidden = true;
    refresh();
    chargeBtn.focus();
  });

  renderMenu();
  refresh();
})();

/* ---- interactive reports chart in the Reports feature panel ---- */
(function () {
  'use strict';
  var barsEl = document.getElementById('repBars');
  var labelsEl = document.getElementById('repLabels');
  if (!barsEl || !labelsEl) return;

  // one week of sample daily figures; last row = today
  var DAYS = [
    { ab: 'Lun', full: 'Lunes',      date: 'Aug 18', benta: 5200, kita: 1310, orders: 41 },
    { ab: 'Mar', full: 'Martes',     date: 'Aug 19', benta: 6800, kita: 1760, orders: 52 },
    { ab: 'Miy', full: 'Miyerkules', date: 'Aug 20', benta: 4600, kita: 1150, orders: 36 },
    { ab: 'Huw', full: 'Huwebes',    date: 'Aug 21', benta: 7700, kita: 2010, orders: 58 },
    { ab: 'Biy', full: 'Biyernes',   date: 'Aug 22', benta: 6100, kita: 1560, orders: 47 },
    { ab: 'Sab', full: 'Sabado',     date: 'Aug 23', benta: 9100, kita: 2440, orders: 68 },
    { ab: 'Lin', full: 'Today',      date: 'Aug 24', benta: 8420, kita: 2180, orders: 63 }
  ];
  var maxBenta = Math.max.apply(null, DAYS.map(function (d) { return d.benta; }));
  var totalBenta = DAYS.reduce(function (s, d) { return s + d.benta; }, 0);
  var selected = DAYS.length - 1; // default: today

  var el = {
    date: document.getElementById('repDate'),
    bentaLbl: document.getElementById('repBentaLbl'),
    benta: document.getElementById('repBenta'),
    bentaDelta: document.getElementById('repBentaDelta'),
    kita: document.getElementById('repKita'),
    margin: document.getElementById('repMargin'),
    orders: document.getElementById('repOrders'),
    basket: document.getElementById('repBasket'),
    total: document.getElementById('repTotal')
  };
  function peso(n) { return '₱' + Math.round(n).toLocaleString('en-US'); }

  function renderChart() {
    barsEl.innerHTML = DAYS.map(function (d, i) {
      var h = Math.max(14, Math.round(d.benta / maxBenta * 100));
      return '<button type="button" class="b' + (i === selected ? ' hi' : '') + '" data-i="' + i +
        '" style="height:' + h + '%" aria-label="' + d.full + ', ' + peso(d.benta) + '">' +
        '<span class="bval">' + peso(d.benta) + '</span></button>';
    }).join('');
    labelsEl.innerHTML = DAYS.map(function (d, i) {
      return '<button type="button" class="' + (i === selected ? 'on' : '') + '" data-i="' + i + '">' + d.ab + '</button>';
    }).join('');
  }

  function renderKpis() {
    var d = DAYS[selected];
    el.date.textContent = (d.full === 'Today' ? 'Today' : d.full) + ' · ' + d.date;
    el.bentaLbl.textContent = d.full === 'Today' ? 'Benta ngayon' : 'Benta';
    el.benta.textContent = peso(d.benta);
    el.kita.textContent = peso(d.kita);
    el.margin.textContent = (d.kita / d.benta * 100).toFixed(1) + '% margin';
    el.orders.textContent = d.orders;
    el.basket.textContent = peso(d.benta / d.orders) + ' avg basket';
    if (selected > 0) {
      var prev = DAYS[selected - 1], diff = (d.benta - prev.benta) / prev.benta * 100;
      var up = diff >= 0;
      el.bentaDelta.textContent = (up ? '▲ ' : '▼ ') + Math.abs(Math.round(diff)) + '% vs ' + prev.ab;
      el.bentaDelta.style.color = up ? '#8ff0b6' : '#fca5a5';
    } else {
      el.bentaDelta.textContent = 'Simula ng linggo';
      el.bentaDelta.style.color = '#bff0e8';
    }
    el.total.textContent = peso(totalBenta) + ' total';
  }

  function select(i) {
    selected = i;
    // toggle highlight without full re-render so the bars keep their transition
    barsEl.querySelectorAll('.b').forEach(function (b, idx) { b.classList.toggle('hi', idx === i); });
    labelsEl.querySelectorAll('button').forEach(function (b, idx) { b.classList.toggle('on', idx === i); });
    renderKpis();
  }

  function onClick(e) {
    var b = e.target.closest('[data-i]');
    if (b) select(+b.getAttribute('data-i'));
  }
  barsEl.addEventListener('click', onClick);
  labelsEl.addEventListener('click', onClick);

  renderChart();
  renderKpis();
})();
