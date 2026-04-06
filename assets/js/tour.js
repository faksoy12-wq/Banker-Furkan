// ── PRODUCT TOUR ───────────────────────────────────────────────────────────
var TOUR_STEPS = [
  { target: '.g4', text: 'Gelir, yatırım ve risk profilini burada görürsün.', pos: 'bottom' },
  { target: '.ticker', text: 'Canlı altın ve döviz kurları anlık güncellenir.', pos: 'bottom' },
  { target: '.bottom-nav, .nav-wrapper', text: 'Sekmeler arasında kaydırarak geçiş yap.', pos: 'top' },
  { target: '#gizlilik-btn', text: 'Rakamlarını gizlemek için bu butonu kullan.', pos: 'bottom' }
];
var tourStep = 0;

function startTour() {
  try { if (localStorage.getItem('mn-tour-done') === '1') return; } catch(e) {}
  tourStep = 0;
  showTourStep();
}

function showTourStep() {
  removeTourOverlay();
  if (tourStep >= TOUR_STEPS.length) { endTour(); return; }
  var step = TOUR_STEPS[tourStep];
  var targetEl = document.querySelector(step.target);
  if (!targetEl) { tourStep++; showTourStep(); return; }

  // Overlay
  var overlay = document.createElement('div');
  overlay.id = 'tour-overlay';
  overlay.className = 'tour-overlay';
  overlay.onclick = function(e) { if (e.target === overlay) nextTourStep(); };
  document.body.appendChild(overlay);

  // Highlight
  var rect = targetEl.getBoundingClientRect();
  var highlight = document.createElement('div');
  highlight.className = 'tour-highlight';
  highlight.style.cssText = 'top:' + (rect.top + window.scrollY - 6) + 'px;left:' + (rect.left - 6) + 'px;width:' + (rect.width + 12) + 'px;height:' + (rect.height + 12) + 'px;';
  document.body.appendChild(highlight);

  // Tooltip
  var tip = document.createElement('div');
  tip.className = 'tour-tooltip tour-tooltip--' + step.pos;
  tip.innerHTML =
    '<div class="tour-text">' + step.text + '</div>' +
    '<div class="tour-footer">' +
      '<span class="tour-counter">' + (tourStep + 1) + ' / ' + TOUR_STEPS.length + '</span>' +
      '<button class="tour-next-btn" onclick="nextTourStep()">' + (tourStep === TOUR_STEPS.length - 1 ? 'Bitir' : 'Sonraki →') + '</button>' +
    '</div>';

  if (step.pos === 'bottom') {
    tip.style.top = (rect.bottom + window.scrollY + 16) + 'px';
  } else {
    tip.style.top = (rect.top + window.scrollY - 16) + 'px';
    tip.style.transform = 'translateY(-100%)';
  }
  tip.style.left = Math.max(16, Math.min(rect.left, window.innerWidth - 300)) + 'px';
  document.body.appendChild(tip);
}

function nextTourStep() { tourStep++; showTourStep(); }

function endTour() {
  removeTourOverlay();
  try { localStorage.setItem('mn-tour-done', '1'); } catch(e) {}
}

function removeTourOverlay() {
  var o = document.getElementById('tour-overlay');
  if (o) o.remove();
  document.querySelectorAll('.tour-highlight, .tour-tooltip').forEach(function(el) { el.remove(); });
}
