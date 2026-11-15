(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function countUp(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    var target = parseFloat(el.dataset.target);
    var dec = parseInt(el.dataset.dec || '0', 10);
    var pre = el.dataset.prefix || '';
    var suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = pre + target.toFixed(dec) + suf; return; }
    var dur = 1400, t0 = performance.now();
    function frame(t) {
      var p = Math.min((t - t0) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + (target * e).toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  var sections = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    sections.forEach(function (s) { s.classList.add('on', 'bars-on'); });
    document.querySelectorAll('[data-target]').forEach(countUp);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('on', 'bars-on');
        e.target.querySelectorAll('[data-target]').forEach(countUp);
        io.unobserve(e.target);
      });
    }, { threshold: 0.18 });
    sections.forEach(function (s) { io.observe(s); });
  }

  // Barra de progreso de lectura
  var bar = document.querySelector('.rx-progress');
  function progress() {
    if (!bar) return;
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? h.scrollTop / max : 0) + ')';
  }
  window.addEventListener('scroll', progress, { passive: true });
  progress();

  // Pestañas con barras que vuelven a crecer
  document.querySelectorAll('[data-tabs]').forEach(function (root) {
    var sec = root.closest('.rx-sec');
    root.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.classList.contains('active')) return;
        var i = btn.getAttribute('data-tab');
        root.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.toggle('active', b === btn); });
        sec.classList.remove('bars-on');
        void sec.offsetWidth;
        root.querySelectorAll('.tab-panel').forEach(function (p) {
          p.classList.toggle('active', p.getAttribute('data-panel') === i);
        });
        requestAnimationFrame(function () { sec.classList.add('bars-on'); });
      });
    });
  });
})();
