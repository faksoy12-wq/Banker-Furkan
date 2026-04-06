// ── MICRO UX ───────────────────────────────────────────────────────────────

// ── RIPPLE EFFECT ──
function addRipple(e) {
  var btn = e.currentTarget;
  if (!btn) return;
  var circle = document.createElement('span');
  var d = Math.max(btn.clientWidth, btn.clientHeight);
  var rect = btn.getBoundingClientRect();
  circle.style.width = d + 'px';
  circle.style.height = d + 'px';
  circle.style.left = (e.clientX - rect.left - d / 2) + 'px';
  circle.style.top = (e.clientY - rect.top - d / 2) + 'px';
  circle.classList.add('ripple-circle');
  btn.style.position = 'relative';
  btn.style.overflow = 'hidden';
  btn.appendChild(circle);
  setTimeout(function() { if (circle.parentNode) circle.remove(); }, 500);
}

// ── NUMBER COUNT-UP ──
function countUp(el, target, duration, suffix) {
  if (!el || GIZLI) return;
  duration = duration || 1200;
  suffix = suffix || '';
  var start = 0;
  var startTime = null;
  function step(ts) {
    if (!startTime) startTime = ts;
    var progress = Math.min((ts - startTime) / duration, 1);
    // easeOutCubic
    var eased = 1 - Math.pow(1 - progress, 3);
    var current = Math.round(start + (target - start) * eased);
    el.textContent = fmtR(current) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ── INIT MICRO UX ──
function initMicroUX() {
  // Add ripple to all primary buttons
  document.querySelectorAll('.ob-btn, .auth-btn, .save-btn, .btn-press').forEach(function(btn) {
    btn.addEventListener('click', addRipple);
    btn.addEventListener('click', haptic);
  });

  // Add btn-press class to interactive buttons
  document.querySelectorAll('.ob-btn, .auth-btn, .save-btn, .done-btn, .edit-pill, .export-btn').forEach(function(btn) {
    btn.classList.add('btn-press');
  });

  // Number count-up on portfolio values load
  initCountUpObserver();
}

function initCountUpObserver() {
  // Animate key values when dashboard becomes visible
  var dashboard = document.getElementById('dashboard');
  if (!dashboard) return;

  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.target.classList && mutation.target.classList.contains('visible')) {
        setTimeout(animatePortfolioValues, 600);
      }
    });
  });
  observer.observe(dashboard, { attributes: true, attributeFilter: ['class'] });
}

function animatePortfolioValues() {
  if (GIZLI) return;
  // Animate health score
  var healthEl = document.getElementById('health-score');
  if (healthEl) {
    var target = parseInt(healthEl.textContent) || 0;
    if (target > 0) countUp(healthEl, target, 1500, '');
  }
}

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() { setTimeout(initMicroUX, 100); });
} else {
  setTimeout(initMicroUX, 100);
}
