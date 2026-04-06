// ── GAMIFICATION SYSTEM ────────────────────────────────────────────────────
var ACHIEVEMENTS = {
  'ilk-adim':        { name: 'İlk Adım',            icon: 'footprints',     desc: 'İlk profilini oluşturdun' },
  'ilk-yatirim':     { name: 'İlk Yatırımcı',       icon: 'trending-up',    desc: 'İlk pozisyonunu ekledin' },
  'disiplin-3':      { name: '3 Ay Serisi',          icon: 'flame',          desc: '3 ay üst üste yatırım yaptın' },
  'tasarrufcu':      { name: 'Tasarruf Ustası',      icon: 'piggy-bank',     desc: '%30+ tasarruf oranına ulaştın' },
  'butce-pro':       { name: 'Bütçe Profesyoneli',   icon: 'check-circle',   desc: '1 ay boyunca hiçbir limiti aşmadın' },
  'altin-koleksiyoner':{ name:'Altın Koleksiyoner',  icon: 'gem',            desc: '10+ gram altın biriktirdin' },
  'saglik-a':        { name: 'A Sınıfı',             icon: 'heart-pulse',    desc: 'Finansal sağlık skoru 80+' },
  'hedef-yarisi':    { name: 'Yarı Yolda',           icon: 'flag',           desc: 'Hedef portföyün %50\'sine ulaştın' }
};

function checkAchievements() {
  if (!P.id) return;
  if (!S.achievements) S.achievements = {};
  var newlyUnlocked = [];

  // İlk Adım — profile exists
  if (!S.achievements['ilk-adim']) {
    S.achievements['ilk-adim'] = new Date().toISOString();
    newlyUnlocked.push('ilk-adim');
  }

  // İlk Yatırımcı
  if (!S.achievements['ilk-yatirim'] && S.bakiye && S.bakiye.length > 0) {
    S.achievements['ilk-yatirim'] = new Date().toISOString();
    newlyUnlocked.push('ilk-yatirim');
  }

  // 3 Ay Serisi
  if (!S.achievements['disiplin-3'] && S.bordrolar && S.bordrolar.length >= 3) {
    S.achievements['disiplin-3'] = new Date().toISOString();
    newlyUnlocked.push('disiplin-3');
  }

  // Tasarruf Ustası
  var gel = P.gelir || 0;
  if (!S.achievements['tasarrufcu'] && gel > 0 && (S.yatirim / gel) >= 0.30) {
    S.achievements['tasarrufcu'] = new Date().toISOString();
    newlyUnlocked.push('tasarrufcu');
  }

  // Bütçe Profesyoneli
  if (!S.achievements['butce-pro'] && S.butce && Object.keys(S.butce).length > 0) {
    var currAy = new Date().toLocaleDateString('tr-TR', {month:'long',year:'numeric'});
    var giderler = (S.giderler || []).filter(function(g) { return g.ay === currAy; });
    if (giderler.length > 0) {
      var catSpend = {};
      giderler.forEach(function(g) { catSpend[g.kategori] = (catSpend[g.kategori] || 0) + g.tutar; });
      var allUnder = true;
      Object.keys(S.butce).forEach(function(k) { if ((catSpend[k] || 0) > S.butce[k]) allUnder = false; });
      if (allUnder) {
        S.achievements['butce-pro'] = new Date().toISOString();
        newlyUnlocked.push('butce-pro');
      }
    }
  }

  // Altın Koleksiyoner
  if (!S.achievements['altin-koleksiyoner'] && S.bakiye) {
    var totalGram = S.bakiye.filter(function(b){return b.arac === 'altin';}).reduce(function(t,b){return t + b.miktar;}, 0);
    if (totalGram >= 10) {
      S.achievements['altin-koleksiyoner'] = new Date().toISOString();
      newlyUnlocked.push('altin-koleksiyoner');
    }
  }

  // A Sınıfı
  if (!S.achievements['saglik-a']) {
    var scoreEl = document.getElementById('health-score');
    if (scoreEl && parseInt(scoreEl.textContent) >= 80) {
      S.achievements['saglik-a'] = new Date().toISOString();
      newlyUnlocked.push('saglik-a');
    }
  }

  // Yarı Yolda
  if (!S.achievements['hedef-yarisi'] && S.bakiye && S.bakiye.length > 0) {
    var totalVal = S.bakiye.reduce(function(t, b) {
      var fn = (typeof ARAC_FN !== 'undefined' && ARAC_FN[b.arac]) ? ARAC_FN[b.arac] : function(){return 1;};
      return t + ((b.arac === 'ppf' || b.arac === 'diger') ? b.maliyet : Math.round(b.miktar * fn()));
    }, 0);
    var kalan = (P.emekYas || 55) - (P.yas || 27);
    var hedefPortfoy = calcPortfoy(S.yatirim, 18, kalan, P.artis || 0);
    if (hedefPortfoy > 0 && totalVal >= hedefPortfoy * 0.5) {
      S.achievements['hedef-yarisi'] = new Date().toISOString();
      newlyUnlocked.push('hedef-yarisi');
    }
  }

  // Show toasts for new achievements
  newlyUnlocked.forEach(function(id) {
    var a = ACHIEVEMENTS[id];
    if (a) showToast('🏅 Başarı Açıldı: ' + a.name + ' — ' + a.desc, 'success', 5000);
  });

  if (newlyUnlocked.length > 0) saveState();
  return newlyUnlocked;
}

function renderAchievementGallery() {
  var container = document.getElementById('achievement-gallery');
  if (!container) return;
  if (!S.achievements) S.achievements = {};

  var keys = Object.keys(ACHIEVEMENTS);
  var unlocked = keys.filter(function(k) { return S.achievements[k]; });
  var locked = keys.filter(function(k) { return !S.achievements[k]; });

  if (unlocked.length === 0 && locked.length === keys.length) {
    container.innerHTML = '<div style="font-size:12px;color:var(--ink3);text-align:center;padding:16px 0;">İlk başarını kazanmak için yatırım yapmaya başla!</div>';
    return;
  }

  var html = '<div class="achievement-grid">';
  unlocked.forEach(function(k) {
    var a = ACHIEVEMENTS[k];
    html += '<div class="achievement-badge unlocked">' +
      '<div class="achievement-icon"><i data-lucide="' + a.icon + '"></i></div>' +
      '<div class="achievement-name">' + a.name + '</div>' +
      '<div class="achievement-desc">' + a.desc + '</div>' +
    '</div>';
  });
  locked.forEach(function(k) {
    var a = ACHIEVEMENTS[k];
    html += '<div class="achievement-badge locked">' +
      '<div class="achievement-icon"><i data-lucide="lock"></i></div>' +
      '<div class="achievement-name">' + a.name + '</div>' +
      '<div class="achievement-desc">' + a.desc + '</div>' +
    '</div>';
  });
  html += '</div>';

  // Streak display
  if (S.streaks) {
    html += '<div class="streak-row">';
    if (S.streaks.tasarruf > 0) html += '<div class="streak-badge"><i data-lucide="flame" class="streak-icon"></i><span>' + S.streaks.tasarruf + ' ay tasarruf serisi</span></div>';
    if (S.streaks.butce > 0) html += '<div class="streak-badge"><i data-lucide="check-circle" class="streak-icon"></i><span>' + S.streaks.butce + ' ay bütçe serisi</span></div>';
    html += '</div>';
  }

  container.innerHTML = html;
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function updateStreaks() {
  if (!S.streaks) S.streaks = { tasarruf: 0, butce: 0, giris: 0 };
  var gel = P.gelir || 0;
  // Savings streak
  if (gel > 0 && (S.yatirim / gel) >= 0.20) {
    S.streaks.tasarruf = (S.streaks.tasarruf || 0) + 1;
  }
  // Interaction streak
  S.streaks.giris = (S.streaks.giris || 0) + 1;
  S.lastInteraction = new Date().toISOString();
  saveState();
}
