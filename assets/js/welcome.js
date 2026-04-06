// ── WELCOME SLIDER ─────────────────────────────────────────────────────────
var WELCOME_SLIDES = [
  {
    icon: '<i data-lucide="wallet" class="ws-lucide"></i>',
    title: 'Paranı Yönet, Geleceğini Kur',
    desc: 'Gelir-gider takibi, yatırım planı ve vergi optimizasyonu tek yerde. Mangır sana özel finansal yol haritası çizer.'
  },
  {
    icon: '<i data-lucide="trending-up" class="ws-lucide"></i>',
    title: 'Kişisel Yatırım Planın',
    desc: 'Risk profiline göre altın, döviz ve fon dağılımı. Bileşik getiri hesaplama ile geleceğini simüle et.'
  },
  {
    icon: '<i data-lucide="target" class="ws-lucide"></i>',
    title: 'Finansal Özgürlüğe Adım At',
    desc: 'Hedef belirle, ilerlemeyi takip et, akıllı öneriler al. Çalışmak zorunluluk değil tercih olsun.'
  }
];
var wsIdx = 0;

function initWelcomeSlider() {
  try { if (localStorage.getItem('mn-welcome-seen') === '1') return; } catch(e) {}
  var el = document.getElementById('welcome-slider');
  if (!el) return;
  el.classList.add('visible');
  renderWelcomeSlide();
  // Touch swipe
  var startX = 0;
  el.addEventListener('touchstart', function(e) { startX = e.touches[0].clientX; }, {passive:true});
  el.addEventListener('touchend', function(e) {
    var diff = e.changedTouches[0].clientX - startX;
    if (Math.abs(diff) > 50) { diff < 0 ? wsNext() : wsPrev(); }
  }, {passive:true});
}

function renderWelcomeSlide() {
  var s = WELCOME_SLIDES[wsIdx];
  var body = document.getElementById('ws-body');
  if (!body) return;
  body.style.opacity = '0';
  body.style.transform = 'translateY(12px)';
  setTimeout(function() {
    body.innerHTML =
      '<div class="ws-icon-wrap">' + s.icon + '</div>' +
      '<div class="ws-title">' + s.title + '</div>' +
      '<div class="ws-desc">' + s.desc + '</div>';
    body.style.opacity = '1';
    body.style.transform = 'translateY(0)';
    // Re-init lucide for new icons
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }, 200);
  // Dots
  var dots = document.getElementById('ws-dots');
  if (dots) {
    dots.innerHTML = WELCOME_SLIDES.map(function(_, i) {
      return '<span class="ws-dot' + (i === wsIdx ? ' active' : '') + '"></span>';
    }).join('');
  }
  // Button text
  var btn = document.getElementById('ws-next-btn');
  if (btn) btn.textContent = wsIdx === WELCOME_SLIDES.length - 1 ? 'Başlayalım →' : 'Devam →';
}

function wsNext() {
  if (wsIdx < WELCOME_SLIDES.length - 1) { wsIdx++; renderWelcomeSlide(); }
  else { closeWelcome(); }
}
function wsPrev() {
  if (wsIdx > 0) { wsIdx--; renderWelcomeSlide(); }
}
function closeWelcome() {
  try { localStorage.setItem('mn-welcome-seen', '1'); } catch(e) {}
  var el = document.getElementById('welcome-slider');
  if (el) { el.style.opacity = '0'; setTimeout(function() { el.classList.remove('visible'); el.style.opacity = ''; }, 400); }
}
