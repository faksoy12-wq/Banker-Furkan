// ── GOAL SYSTEM ────────────────────────────────────────────────────────────
var GOAL_TYPES = {
  acil:       { name: 'Acil Durum Fonu',    icon: 'shield-check',  desc: '3-6 aylık giderini karşılayacak güvenlik ağı', defaultTarget: 0 },
  ev:         { name: 'Ev Sahibi Ol',       icon: 'home',          desc: 'Hayalindeki eve bir adım daha yaklaş',         defaultTarget: 2000000 },
  araba:      { name: 'Araba Al',           icon: 'car',           desc: 'Binek aracını kendin finanse et',               defaultTarget: 800000 },
  tatil:      { name: 'Rüya Tatili',        icon: 'plane',         desc: 'Hak ettiğin tatili planla ve gerçekleştir',     defaultTarget: 120000 },
  egitim:     { name: 'Eğitim Yatırımı',    icon: 'graduation-cap',desc: 'Kendine veya çocuğuna yatırım yap',           defaultTarget: 500000 },
  emeklilik:  { name: 'Erken Emeklilik',    icon: 'palm-tree',     desc: 'FIRE hedefine doğru ilerle',                   defaultTarget: 0 },
  teknoloji:  { name: 'Teknoloji',          icon: 'laptop',        desc: 'İstediğin cihazı al, borçsuz',                 defaultTarget: 80000 },
  ozel:       { name: 'Özel Hedef',         icon: 'star',          desc: 'Kendi hedefini belirle',                        defaultTarget: 0 }
};

var GOAL_MILESTONES = [
  { pct: 10,  msg: 'Harika başlangıç! Yolculuk başladı.' },
  { pct: 25,  msg: 'Çeyrek yoldasın, devam et!' },
  { pct: 50,  msg: 'Yarısına geldin! En zor kısım bitti.' },
  { pct: 75,  msg: 'Neredeyse oradasın! Son sprint!' },
  { pct: 100, msg: 'Tebrikler! Hedefine ulaştın!' }
];

function goalEkle() {
  var typeEl = document.getElementById('goal-type');
  var nameEl = document.getElementById('goal-name');
  var targetEl = document.getElementById('goal-target');
  if (!typeEl || !targetEl) return;

  var type = typeEl.value;
  var info = GOAL_TYPES[type];
  var name = (nameEl && nameEl.value.trim()) ? nameEl.value.trim() : info.name;
  var target = parseInt(targetEl.value) || info.defaultTarget;

  if (!target || target <= 0) { showToast('Geçerli bir hedef tutar gir', 'warning'); return; }

  if (!S.goals) S.goals = [];
  S.goals.push({
    id: Date.now(),
    type: type,
    name: name,
    target: target,
    saved: 0,
    createdAt: new Date().toISOString()
  });
  saveState();
  renderGoals();
  haptic();
  showToast(name + ' hedefi oluşturuldu', 'success');
}

function goalSil(id) {
  if (!confirm('Bu hedefi silmek istiyor musun?')) return;
  S.goals = (S.goals || []).filter(function(g) { return g.id !== id; });
  saveState();
  renderGoals();
}

function goalBirikim(id) {
  var goal = (S.goals || []).find(function(g) { return g.id === id; });
  if (!goal) return;
  var input = document.getElementById('goal-add-' + id);
  var amount = parseInt(input ? input.value : 0) || 0;
  if (amount <= 0) { showToast('Geçerli bir tutar gir', 'warning'); return; }

  var prevPct = goal.target > 0 ? (goal.saved / goal.target * 100) : 0;
  goal.saved += amount;
  var newPct = goal.target > 0 ? (goal.saved / goal.target * 100) : 0;

  // Check milestone messages
  GOAL_MILESTONES.forEach(function(m) {
    if (prevPct < m.pct && newPct >= m.pct) {
      showToast(m.msg, 'success', 5000);
    }
  });

  saveState();
  renderGoals();
  haptic();
  if (input) input.value = '';
}

function renderGoals() {
  var container = document.getElementById('goals-container');
  if (!container) return;
  if (!S.goals) S.goals = [];

  // Goal type selector + form
  var formHtml = '<div class="card goal-form-card">' +
    '<div class="ct"><i data-lucide="plus-circle" style="width:14px;height:14px;"></i> Yeni Hedef Ekle</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">' +
      '<div><label class="goal-label">Hedef Türü</label>' +
        '<select id="goal-type" class="month-select" style="font-size:14px;padding:8px 10px;" onchange="goalTypeChanged()">' +
          Object.keys(GOAL_TYPES).map(function(k) {
            return '<option value="' + k + '">' + GOAL_TYPES[k].name + '</option>';
          }).join('') +
        '</select></div>' +
      '<div><label class="goal-label">Hedef Tutar (₺)</label>' +
        '<input type="number" id="goal-target" class="form-input" placeholder="örn: 500000" inputmode="numeric" style="padding:8px 10px;"></div>' +
    '</div>' +
    '<div style="margin-bottom:10px;"><label class="goal-label">Özel İsim (Opsiyonel)</label>' +
      '<input type="text" id="goal-name" class="form-input" placeholder="örn: Bodrum Tatili" style="padding:8px 10px;"></div>' +
    '<div id="goal-type-desc" style="font-size:11px;color:var(--ink3);margin-bottom:10px;line-height:1.5;">' + GOAL_TYPES.acil.desc + '</div>' +
    '<button onclick="goalEkle()" class="btn-press" style="width:100%;padding:10px;background:var(--green);color:white;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:var(--sans);">+ Hedef Oluştur</button>' +
  '</div>';

  // Goal cards
  var cardsHtml = '';
  if (S.goals.length === 0) {
    cardsHtml = '<div style="font-size:12px;color:var(--ink3);text-align:center;padding:32px 0;">Henüz hedef oluşturulmadı. Yukarıdan ilk hedefini ekle!</div>';
  } else {
    cardsHtml = S.goals.map(function(g) {
      var info = GOAL_TYPES[g.type] || GOAL_TYPES.ozel;
      var pct = g.target > 0 ? Math.min(100, (g.saved / g.target * 100)) : 0;
      var remaining = Math.max(0, g.target - g.saved);

      // Current milestone message
      var milestoneMsg = '';
      for (var i = GOAL_MILESTONES.length - 1; i >= 0; i--) {
        if (pct >= GOAL_MILESTONES[i].pct) { milestoneMsg = GOAL_MILESTONES[i].msg; break; }
      }

      // Ring color
      var ringColor = pct >= 100 ? 'var(--green)' : pct >= 50 ? 'var(--gold)' : 'var(--blue)';
      var offset = 188.5 - (188.5 * pct / 100);

      return '<div class="card goal-card">' +
        '<div class="goal-card-header">' +
          '<div class="goal-card-info">' +
            '<div class="goal-card-icon" style="color:' + ringColor + ';"><i data-lucide="' + info.icon + '"></i></div>' +
            '<div><div class="goal-card-name">' + esc(g.name) + '</div>' +
              '<div class="goal-card-sub">' + info.desc + '</div></div>' +
          '</div>' +
          '<button onclick="goalSil(' + g.id + ')" style="background:none;border:none;cursor:pointer;color:var(--ink3);font-size:16px;padding:4px;">×</button>' +
        '</div>' +
        // Progress ring
        '<div class="goal-progress-wrap">' +
          '<svg width="80" height="80" viewBox="0 0 80 80" class="goal-ring">' +
            '<circle cx="40" cy="40" r="30" fill="none" stroke="var(--border)" stroke-width="6"></circle>' +
            '<circle cx="40" cy="40" r="30" fill="none" stroke="' + ringColor + '" stroke-width="6" stroke-linecap="round" stroke-dasharray="188.5" stroke-dashoffset="' + offset + '" style="transition:stroke-dashoffset 0.8s ease;"></circle>' +
          '</svg>' +
          '<div class="goal-pct">' + Math.round(pct) + '%</div>' +
        '</div>' +
        // Amounts
        '<div class="goal-amounts">' +
          '<div><div class="goal-amt-label">Biriken</div><div class="goal-amt-val" style="color:var(--green);">' + fmtN(g.saved) + ' ₺</div></div>' +
          '<div><div class="goal-amt-label">Hedef</div><div class="goal-amt-val">' + fmtN(g.target) + ' ₺</div></div>' +
          '<div><div class="goal-amt-label">Kalan</div><div class="goal-amt-val" style="color:var(--gold);">' + fmtN(remaining) + ' ₺</div></div>' +
        '</div>' +
        // Milestone message
        (milestoneMsg ? '<div class="goal-milestone">' + milestoneMsg + '</div>' : '') +
        // Add savings input
        '<div class="goal-add-row">' +
          '<input type="number" id="goal-add-' + g.id + '" class="form-input" placeholder="Tutar ₺" inputmode="numeric" style="flex:1;padding:8px 10px;">' +
          '<button onclick="goalBirikim(' + g.id + ')" class="btn-press" style="padding:8px 16px;background:var(--green);color:white;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;">+ Ekle</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  container.innerHTML = formHtml + cardsHtml;
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function goalTypeChanged() {
  var type = document.getElementById('goal-type').value;
  var info = GOAL_TYPES[type];
  if (!info) return;
  var descEl = document.getElementById('goal-type-desc');
  if (descEl) descEl.textContent = info.desc;
  var targetEl = document.getElementById('goal-target');
  if (targetEl && info.defaultTarget > 0) targetEl.value = info.defaultTarget;
  var nameEl = document.getElementById('goal-name');
  if (nameEl) nameEl.placeholder = info.name;
}
