// ── INSIGHT SYSTEM ─────────────────────────────────────────────────────────
function generateInsights() {
  if (!P.id) return [];
  var insights = [];
  var gel = P.gelir || 0;
  var yat = S.yatirim || 0;
  var currAy = new Date().toLocaleDateString('tr-TR', {month:'long',year:'numeric'});
  var giderler = (S.giderler || []).filter(function(g) { return g.ay === currAy; });
  var gToplam = giderler.reduce(function(a, b) { return a + b.tutar; }, 0);
  var dismissed = S.dismissedInsights || [];

  // ── WARNINGS ──
  // 1. Spending > 40% of income
  if (gel > 0 && gToplam / gel > 0.40) {
    insights.push({ id: 'w-spend-high', type: 'warning', priority: 1,
      text: 'Harcamaların gelirinin %' + Math.round(gToplam / gel * 100) + '\'ini aştı. Bütçe limitlerini gözden geçir.' });
  }
  // 2. Investment rate < 20%
  if (gel > 0 && yat / gel < 0.20) {
    insights.push({ id: 'w-invest-low', type: 'warning', priority: 1,
      text: 'Bu ay yatırım oranın %' + Math.round(yat / gel * 100) + '\'e düştü. Hedefin %20 üstüydü.' });
  }
  // 3. Budget category exceeded
  if (S.butce) {
    var catSpend = {};
    giderler.forEach(function(g) { catSpend[g.kategori] = (catSpend[g.kategori] || 0) + g.tutar; });
    Object.keys(S.butce).forEach(function(k) {
      if (catSpend[k] && catSpend[k] > S.butce[k]) {
        var info = GIDER_KATS[k] || {ad: k};
        insights.push({ id: 'w-budget-' + k, type: 'warning', priority: 1,
          text: info.ad + ' harcaman bütçe limitini %' + Math.round((catSpend[k] / S.butce[k] - 1) * 100) + ' aştı.' });
      }
    });
  }
  // 4. No bordro for 90 days
  if (S.bordrolar && S.bordrolar.length > 0) {
    var lastDate = new Date(S.bordrolar[0].tarih.split('.').reverse().join('-'));
    if ((new Date() - lastDate) > 90 * 86400000) {
      insights.push({ id: 'w-bordro-old', type: 'warning', priority: 2,
        text: '3 aydır bordro girmedin. Vergi dilimi güncel olmayabilir.' });
    }
  }
  // 5. No emergency fund
  var totalBakiye = (S.bakiye || []).reduce(function(t, b) {
    var fn = (typeof ARAC_FN !== 'undefined' && ARAC_FN[b.arac]) ? ARAC_FN[b.arac] : function(){return 1;};
    return t + ((b.arac === 'ppf' || b.arac === 'diger') ? b.maliyet : Math.round(b.miktar * fn()));
  }, 0);
  var avgMonthlyExpense = gToplam || (gel * 0.5);
  if (totalBakiye < avgMonthlyExpense * 3 && totalBakiye >= 0) {
    insights.push({ id: 'w-emergency', type: 'warning', priority: 2,
      text: 'Acil durum fonun henüz oluşmamış. 3 aylık giderin kadar nakit ayır.' });
  }

  // ── SUGGESTIONS ──
  // 6. Gold price dropped
  if (S.rates.altin && S.prev.altin && S.prev.altin > 0) {
    var chg = ((S.rates.altin - S.prev.altin) / S.prev.altin) * 100;
    if (chg < -2) {
      insights.push({ id: 's-gold-dip', type: 'suggestion', priority: 2,
        text: 'Altın fiyatı son güncellemede %' + Math.abs(chg).toFixed(1) + ' düştü. Alım fırsatı olabilir.' });
    }
  }
  // 7. Payday approaching
  try {
    var maasData = JSON.parse(localStorage.getItem('mn-maas-' + (P.id || P.ad)) || 'null');
    if (maasData) {
      var today = new Date().getDate();
      var gun = maasData.gun || 15;
      var daysTo = gun - today;
      if (daysTo < 0) daysTo += 30;
      if (daysTo <= 2 && daysTo >= 0) {
        insights.push({ id: 's-payday', type: 'suggestion', priority: 2,
          text: 'Maaş günün yaklaşıyor. Yatırım planını hazırla.' });
      }
    }
  } catch(e) {}
  // 8. No increase in 6 months
  if ((P.artis || 0) === 0 && S.bordrolar && S.bordrolar.length >= 6) {
    insights.push({ id: 's-increase', type: 'suggestion', priority: 3,
      text: '6 aydır yatırımını artırmadın. %5 artışla önemli bir fark yaratabilirsin.' });
  }
  // 9. Insurance reminder
  if (P.sigorta === 'var' && new Date().getDate() > 20) {
    insights.push({ id: 's-insurance', type: 'suggestion', priority: 3,
      text: 'Sigorta vergi iadesini talep etmeyi unutma bu ay.' });
  }
  // 10. Projected overspend
  var dayOfMonth = new Date().getDate();
  var daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  if (dayOfMonth > 5 && gToplam > 0) {
    var projected = Math.round(gToplam / dayOfMonth * daysInMonth);
    var available = gel - yat;
    if (projected > available) {
      insights.push({ id: 's-overspend', type: 'suggestion', priority: 2,
        text: 'Gider trendine göre ayın sonunda ' + fmtN(projected - available) + ' ₺ açık verebilirsin.' });
    }
  }

  // ── POSITIVE ──
  // 11. High savings rate
  if (gel > 0 && yat / gel >= 0.30) {
    insights.push({ id: 'p-high-save', type: 'positive', priority: 3,
      text: 'Bu ay %' + Math.round(yat / gel * 100) + ' tasarruf oranına ulaştın. Harika gidiyorsun!' });
  }
  // 12. Portfolio milestone
  if (totalBakiye >= 100000) {
    insights.push({ id: 'p-milestone', type: 'positive', priority: 3,
      text: 'Portföyün ' + fmtN(totalBakiye) + ' ₺\'ye ulaştı. Yeni bir kilometre taşı!' });
  }
  // 13. Consistent investing
  if (S.bordrolar && S.bordrolar.length >= 3) {
    insights.push({ id: 'p-consistent', type: 'positive', priority: 3,
      text: S.bordrolar.length + ' aydır düzenli bordro giriyorsun. Tutarlılık her şeyden önemli.' });
  }
  // 14. All under budget
  if (S.butce && Object.keys(S.butce).length > 0) {
    var allUnder = true;
    var catSpend2 = {};
    giderler.forEach(function(g) { catSpend2[g.kategori] = (catSpend2[g.kategori] || 0) + g.tutar; });
    Object.keys(S.butce).forEach(function(k) { if ((catSpend2[k] || 0) > S.butce[k]) allUnder = false; });
    if (allUnder && giderler.length > 0) {
      insights.push({ id: 'p-budget-ok', type: 'positive', priority: 3,
        text: 'Bütçe limitlerinin hiçbirini aşmadın bu ay. Disiplinli!' });
    }
  }

  // Filter dismissed
  return insights.filter(function(ins) { return dismissed.indexOf(ins.id) === -1; })
    .sort(function(a, b) { return a.priority - b.priority; });
}

function renderInsights() {
  var container = document.getElementById('insight-container');
  if (!container) return;
  var insights = generateInsights();
  if (!insights.length) { container.innerHTML = ''; return; }

  // Show max 3
  var shown = insights.slice(0, 3);
  var typeConfig = {
    warning:    { icon: 'alert-triangle', bg: 'var(--red-bg)',   bd: 'var(--red-bd)',   color: 'var(--red)',  label: 'Uyarı' },
    suggestion: { icon: 'lightbulb',      bg: 'var(--gold-bg)',  bd: 'var(--gold-bd)',  color: 'var(--gold)', label: 'Öneri' },
    positive:   { icon: 'sparkles',       bg: 'var(--green-bg)', bd: 'var(--green-bd)', color: 'var(--green)',label: 'Başarı' }
  };

  container.innerHTML = shown.map(function(ins) {
    var cfg = typeConfig[ins.type] || typeConfig.suggestion;
    return '<div class="insight-card" style="background:' + cfg.bg + ';border:1px solid ' + cfg.bd + ';">' +
      '<div class="insight-header">' +
        '<div class="insight-icon" style="color:' + cfg.color + ';"><i data-lucide="' + cfg.icon + '"></i></div>' +
        '<span class="insight-label" style="color:' + cfg.color + ';">' + cfg.label + '</span>' +
        '<button class="insight-dismiss" onclick="dismissInsight(\'' + ins.id + '\')" title="Kapat">×</button>' +
      '</div>' +
      '<div class="insight-text">' + ins.text + '</div>' +
    '</div>';
  }).join('');

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function dismissInsight(id) {
  if (!S.dismissedInsights) S.dismissedInsights = [];
  S.dismissedInsights.push(id);
  saveState();
  renderInsights();
}
