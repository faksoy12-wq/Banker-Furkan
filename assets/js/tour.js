// ── PRODUCT TOUR ───────────────────────────────────────────────────────────
var TOUR_STEPS = [
  { target: '.g4', text: 'Gelir, yatırım ve risk profilini burada takip edersin. Düzenlemek için karta dokun.', pos: 'bottom' },
  { target: '.ticker', text: 'Canlı altın ve döviz kurları anlık güncellenir. Piyasayı her zaman takipte tut.', pos: 'bottom' },
  { target: '[onclick*="bakiye"]', text: 'Bakiyem: Altın, döviz ve fon pozisyonlarını ekle, portföy değerini anlık izle.', pos: 'top' },
  { target: '[onclick*="hedef"]', text: 'Hedef: Finansal hedeflerini oluştur, ilerlemeyi SVG halkaları ile takip et.', pos: 'top' },
  { target: '[onclick*="calculator"]', text: 'Hesap Makinesi: Bileşik getiri hesapla, farklı senaryoları simüle et.', pos: 'top' },
  { target: '[onclick*="gider"]', text: 'Giderler: Harcamalarını kategorize et, bütçe limitleri belirle, trendleri gör.', pos: 'top' },
  { target: '#gizlilik-btn', text: 'Gizlilik: Rakamlarını tek tuşla maskele, yanında biri varken kullan.', pos: 'bottom' },
  { target: '#theme-btn', text: 'Tema: Açık ve koyu mod arasında geçiş yap.', pos: 'bottom' }
];
var tourStep = 0;

function startTour() {
  try { if (localStorage.getItem('mn-tour-v3') === '1') return; } catch(e) {}
  var ws = document.getElementById('welcome-slider');
  if (ws && ws.classList.contains('visible')) return; // Will be triggered when welcome slider closes
  tourStep = 0;
  showTourStep();
}

function showTourStep() {
  removeTourOverlay();
  if (tourStep >= TOUR_STEPS.length) { endTour(); return; }
  var step = TOUR_STEPS[tourStep];
  var targetEl = null;
  step.target.split(',').some(function(sel) {
    var els = document.querySelectorAll(sel.trim());
    for(var i=0; i<els.length; i++) {
        if(els[i].offsetParent !== null) { // if element is visible
            targetEl = els[i];
            return true;
        }
    }
    return false;
  });
  if (!targetEl) { tourStep++; showTourStep(); return; }

  var overlay = document.createElement('div');
  overlay.id = 'tour-overlay';
  overlay.className = 'tour-overlay';
  overlay.onclick = function(e) { if (e.target === overlay) nextTourStep(); };
  document.body.appendChild(overlay);

  var rect = targetEl.getBoundingClientRect();
  var highlight = document.createElement('div');
  highlight.className = 'tour-highlight';
  highlight.style.cssText = 'top:' + (rect.top + window.scrollY - 6) + 'px;left:' + (rect.left - 6) + 'px;width:' + (rect.width + 12) + 'px;height:' + (rect.height + 12) + 'px;';
  document.body.appendChild(highlight);

  var isTop = rect.top < 150;
  var pos = isTop ? 'bottom' : step.pos;
  var tip = document.createElement('div');
  tip.className = 'tour-tooltip tour-tooltip--' + pos;
  tip.innerHTML =
    '<div class="tour-text">' + step.text + '</div>' +
    '<div class="tour-footer">' +
      '<span class="tour-counter">' + (tourStep + 1) + ' / ' + TOUR_STEPS.length + '</span>' +
      '<div style="display:flex;gap:6px;">' +
        (tourStep > 0 ? '<button class="tour-skip-btn" onclick="endTour()">Atla</button>' : '') +
        '<button class="tour-next-btn" onclick="nextTourStep()">' + (tourStep === TOUR_STEPS.length - 1 ? 'Bitir' : 'Sonraki →') + '</button>' +
      '</div>' +
    '</div>';

  if (pos === 'bottom') {
    tip.style.top = (rect.bottom + window.scrollY + 16) + 'px';
  } else {
    tip.style.top = (rect.top + window.scrollY - 16) + 'px';
    tip.style.transform = 'translateY(-100%)';
  }
  tip.style.left = Math.max(16, Math.min(rect.left, window.innerWidth - 300)) + 'px';
  document.body.appendChild(tip);
  
  // Ensure tooltip is visible
  setTimeout(function(){
    var tipRect = tip.getBoundingClientRect();
    if (tipRect.top < 0 || tipRect.bottom > window.innerHeight) {
        tip.scrollIntoView({behavior: 'smooth', block: 'center'});
    }
  }, 50);
}

function nextTourStep() { tourStep++; showTourStep(); }

function endTour() {
  removeTourOverlay();
  try { localStorage.setItem('mn-tour-v3', '1'); } catch(e) {}
}

function removeTourOverlay() {
  var o = document.getElementById('tour-overlay');
  if (o) o.remove();
  document.querySelectorAll('.tour-highlight, .tour-tooltip').forEach(function(el) { el.remove(); });
}
