// ── STATE ─────────────────────────────────────────────────────────────────
var P = {};
var S = { yatirim:30000, maas:75000, brut:0, vergiBrut:0,
  rates:{altin:null,usd:null,eur:null,ons:null}, prev:{altin:null,usd:null,eur:null,ons:null},
  bordrolar:[], bakiye:[], araclar:[], alarmlar:[], alarmGecmis:[], sigortaBaslangic:null, giderler:[], tekrarlayan:[], butce:{},
  dismissedInsights:[], achievements:{}, streaks:{tasarruf:0,butce:0,giris:0}, lastInteraction:null, goals:[] };
var rateInterval = null; // Memory leak fix: tek global interval
var TAB_ORDER=['portfolio','bakiye','hedef','yolharitasi','aksiyon','calculator','alarmlar','bordro','vergi','gider'];
var currentTabIdx=0;

function haptic(){try{if(navigator.vibrate)navigator.vibrate(50);}catch(e){}}
function scrollToEl(id){var el=document.getElementById(id);if(el){el.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(function(){el.focus();},300);}}
function emptyState(icon,title,desc,btnText,btnAction){
  return '<div class="empty-state">'+
    '<div class="empty-state-icon">'+icon+'</div>'+
    '<div class="empty-state-title">'+title+'</div>'+
    '<div class="empty-state-desc">'+desc+'</div>'+
    (btnText?'<button class="empty-state-btn" onclick="'+btnAction+'">'+btnText+'</button>':'')+
    '</div>';
}

// ── AUTH ──────────────────────────────────────────────────────────────────
// Profiller: [{id, ad, yas, meslek, ...}] — id benzersiz, ad tekrar edebilir
var TUM_PROFILLER = JSON.parse((function(){ try{ return localStorage.getItem('mn-profiller')||'[]' }catch(e){ return '[]' } })());

function showAuthScreen() {
  // Her zaman portföy sekmesine sıfırla
  resetTabToPortfolio();
  document.getElementById('dashboard').classList.remove('visible');
  document.getElementById('onboarding').classList.remove('visible');
  document.getElementById('auth-screen').classList.add('visible');
  TUM_PROFILLER = JSON.parse((function(){ try{ return localStorage.getItem('mn-profiller')||'[]' }catch(e){ return '[]' } })());
  // Show/hide explore button based on whether profiles exist
  var exploreBtn = document.getElementById('explore-app-btn');
  if (exploreBtn) exploreBtn.style.display = TUM_PROFILLER.length === 0 ? 'flex' : 'none';
  if (TUM_PROFILLER.length > 0) showProfileSelect();
  else { document.getElementById('profile-select-mode').style.display='none'; document.getElementById('auth-form-mode').style.display='block'; switchAuthTab('kayit'); }
}

function resetTabToPortfolio() {
  // Aktif tab'ı portföye döndür (profil değişiminde)
  document.querySelectorAll('.tab').forEach(function(t){ t.classList.remove('active'); });
  document.querySelectorAll('.nb').forEach(function(b){ b.classList.remove('active'); });
  var pt = document.getElementById('tab-portfolio');
  if (pt) pt.classList.add('active');
  var nbs = document.querySelectorAll('.nb');
  if (nbs.length > 0) nbs[0].classList.add('active');
}

function showProfileSelect() {
  document.getElementById('profile-select-mode').style.display='block';
  document.getElementById('auth-form-mode').style.display='none';
  var listEl = document.getElementById('profile-list');
  var meslekEmoji = {doktor:'<i data-lucide="heart-pulse" class="lu"></i>',ogretmen:'<i data-lucide="book-open" class="lu"></i>',muhendis:'<i data-lucide="laptop" class="lu"></i>',memur:'<i data-lucide="landmark" class="lu"></i>',ozel:'<i data-lucide="building" class="lu"></i>',serbest:'<i data-lucide="rocket" class="lu"></i>'};
  listEl.innerHTML = TUM_PROFILLER.map(function(p,i){
    var initial = p.ad ? esc(p.ad.charAt(0).toUpperCase()) : '?';
    var pct = p.gelir > 0 ? Math.round((p.yatirim/p.gelir)*100) : 0;
    return '<div class="profile-item" onclick="profilSec('+i+')">' +
      '<div class="profile-avatar">'+initial+'</div>' +
      '<div class="profile-info"><div class="profile-name" style="display:flex;align-items:center;gap:6px;">'+(meslekEmoji[p.meslek]||'<i data-lucide="user" class="lu"></i>')+' '+esc(p.ad)+'</div>' +
      '<div class="profile-meta">'+p.yas+' yaş · '+p.emekYas+' hedef · %'+pct+' tasarruf</div></div>' +
      '<div style="display:flex;align-items:center;gap:6px;">' +
      '<button onclick="profilSil(event,'+i+')" style="font-size:10px;padding:3px 8px;border-radius:10px;border:1px solid var(--red-bd);background:var(--red-bg);color:var(--red);cursor:pointer;font-family:var(--sans);">Sil</button>' +
      '<div style="color:var(--ink3);font-size:18px;">›</div></div></div>';
  }).join('');
}

function profilSil(evt, i) {
  evt.stopPropagation();
  if (!confirm(TUM_PROFILLER[i].ad + ' profilini silmek istiyor musun?')) return;
  // Profil state'ini de sil
  try { localStorage.removeItem('mn-state-' + TUM_PROFILLER[i].id); } catch(e) {}
  TUM_PROFILLER.splice(i, 1);
  try { localStorage.setItem('mn-profiller', JSON.stringify(TUM_PROFILLER)); } catch(e) {}
  showProfileSelect();
}

function showNewProfile() {
  document.getElementById('profile-select-mode').style.display='none';
  document.getElementById('auth-form-mode').style.display='block';
  switchAuthTab('kayit');
}

function switchAuthTab(tab) {
  document.getElementById('tab-giris-btn').classList.toggle('active', tab==='giris');
  document.getElementById('tab-kayit-btn').classList.toggle('active', tab==='kayit');
  document.getElementById('auth-giris').classList.toggle('active', tab==='giris');
  document.getElementById('auth-kayit').classList.toggle('active', tab==='kayit');
}

function girisYap() {
  var ad = document.getElementById('giris-ad').value.trim();
  if (!ad) { showHata('giris','Lütfen adını gir.'); return; }
  // Ada göre profilleri bul
  var eslesme = TUM_PROFILLER.filter(function(p){ return p.ad.toLowerCase() === ad.toLowerCase(); });
  if (!eslesme.length) { showHata('giris','"'+ad+'" adında profil bulunamadı.'); return; }
  if (eslesme.length === 1) {
    // Tek eşleşme — direkt giriş
    var idx = TUM_PROFILLER.indexOf(eslesme[0]);
    profilSec(idx);
  } else {
    // Birden fazla aynı isimli profil — seçim sun
    document.getElementById('profile-select-mode').style.display='block';
    document.getElementById('auth-form-mode').style.display='none';
    var listEl = document.getElementById('profile-list');
    listEl.innerHTML = '<div style="font-size:13px;font-weight:700;margin-bottom:10px;color:var(--gold);">Hangi "'+esc(ad)+'" profili?</div>' +
      eslesme.map(function(p){
        var idx = TUM_PROFILLER.indexOf(p);
        return '<div class="profile-item" onclick="profilSec('+idx+')">' +
          '<div class="profile-avatar">'+esc(p.ad.charAt(0).toUpperCase())+'</div>' +
          '<div class="profile-info"><div class="profile-name">'+esc(p.ad)+'</div>' +
          '<div class="profile-meta">'+p.yas+' yaş · Oluşturulma: '+(p.olusturulma||'—')+'</div></div>' +
          '<div style="color:var(--ink3);font-size:18px;">›</div></div>';
      }).join('');
  }
}

function kayitOl() {
  var ad = document.getElementById('kayit-ad').value.trim();
  if (!ad) { showHata('kayit','Lütfen adını gir.'); return; }
  // Aynı isimli kayıt ARTIK ENGELLENMEZ — benzersiz ID ile ayrılır
  obData.ad = ad;
  document.getElementById('auth-screen').classList.remove('visible');
  document.getElementById('onboarding').classList.add('visible');
  obStep = 1;
  document.querySelectorAll('.ob-step').forEach(function(s){ s.classList.remove('active'); });
  document.getElementById('step-1').classList.add('active');
  updateObProgress();
}

function profilSec(i) {
  P = JSON.parse(JSON.stringify(TUM_PROFILLER[i]));
  loadProfileState();
  try{ GIZLI = localStorage.getItem('mn-gizli')==='1'; }catch(e){ GIZLI=false; }
  document.getElementById('auth-screen').classList.remove('visible');
  document.getElementById('dashboard').classList.add('visible');
  resetTabToPortfolio();
  // Skeleton loader: stat kartlarına shimmer ekle
  document.querySelectorAll('.stat').forEach(function(s){s.classList.add('skeleton-active');});
  initDashboard();
  fetchRates().finally(function(){
    document.querySelectorAll('.stat.skeleton-active').forEach(function(s){s.classList.remove('skeleton-active');});
  });
  if(rateInterval)clearInterval(rateInterval);
  rateInterval=setInterval(fetchRates,30000);
  setTimeout(initScrollHints, 300);
  setTimeout(initPullToRefresh, 500);
  showToast('Hoşgeldin, '+esc(P.ad)+'!','success',2500);
}

function showHata(form, msg) {
  var el = document.getElementById(form+'-hata');
  el.textContent = msg; el.style.display = 'block';
  setTimeout(function(){ el.style.display='none'; }, 4000);
}

function loadProfileState() {
  var key = 'mn-state-' + (P.id || P.ad);
  try {
    var st = JSON.parse(localStorage.getItem(key)||'{}');
    S.yatirim       = st.yatirim  || P.yatirim;
    S.maas          = st.maas     || P.gelir;
    S.bordrolar     = st.bordro   || [];
    S.bakiye        = st.bakiye   || [];
    S.araclar       = st.araclar  || getDefaultAraclar(P.risk||'dengeli');
    S.alarmlar      = st.alarmlar || [];
    S.alarmGecmis   = st.alarmGecmis || [];
    S.sigortaBaslangic = st.sigortaBaslangic || (P.sigorta==='var' ? new Date().toISOString() : null);
    S.brut          = st.brut     || 0;
    S.vergiBrut     = st.vergiBrut|| 0;
    S.giderler      = st.giderler || [];
    S.tekrarlayan   = st.tekrarlayan || [];
    S.butce         = st.butce || {};
    S.dismissedInsights = st.dismissedInsights || [];
    S.achievements  = st.achievements || {};
    S.streaks       = st.streaks || {tasarruf:0,butce:0,giris:0};
    S.lastInteraction = st.lastInteraction || null;
    S.goals         = st.goals || [];
  } catch(e) {
    S.yatirim = P.yatirim; S.maas = P.gelir;
    S.araclar = getDefaultAraclar(P.risk||'dengeli');
  }
}

function saveState() {
  if (!P.id) return;
  var key = 'mn-state-' + P.id;
  try {
    localStorage.setItem(key, JSON.stringify({
      yatirim:S.yatirim, maas:S.maas, brut:S.brut, vergiBrut:S.vergiBrut,
      bordro:S.bordrolar, bakiye:S.bakiye, araclar:S.araclar,
      alarmlar:S.alarmlar, alarmGecmis:S.alarmGecmis, sigortaBaslangic:S.sigortaBaslangic,
      giderler:S.giderler||[], tekrarlayan:S.tekrarlayan||[], butce:S.butce||{},
      dismissedInsights:S.dismissedInsights||[], achievements:S.achievements||{},
      streaks:S.streaks||{}, lastInteraction:S.lastInteraction, goals:S.goals||[]
    }));
  } catch(e) {
    showToast('Veri kaydedilemedi — depolama alanı dolu olabilir','error',5000);
  }
}

// ── ONBOARDING ────────────────────────────────────────────────────────────
var obStep = 1, obTotal = 9;
var obData = {ad:'',yas:27,meslek:'',gelir:75000,yatirim:30000,risk:'dengeli',emekYas:55,artis:0,sigorta:'yok',sigortaPrim:0,sigortaPB:'tl'};

function updateObProgress() {
  document.getElementById('ob-prog').style.width=(obStep/obTotal*100)+'%';
  document.getElementById('ob-prog-text').textContent='Adım '+obStep+' / '+obTotal;
}

function nextStep() { if (!validateStep(obStep)) return; document.getElementById('step-'+obStep).classList.remove('active'); obStep++; document.getElementById('step-'+obStep).classList.add('active'); updateObProgress(); if (obStep===9) buildSummary(); window.scrollTo(0,0); }
function prevStep() { if (obStep<=1) return; document.getElementById('step-'+obStep).classList.remove('active'); obStep--; document.getElementById('step-'+obStep).classList.add('active'); updateObProgress(); }

function validateStep(step) {
  if (step===1)  { obData.yas=parseInt(document.getElementById('ob-yas').value)||27; }
  if (step===2)  { if(!obData.meslek){alert('Mesleğini seç.');return false;} }
  if (step===3)  { var g=parseInt(document.getElementById('ob-gelir').value);if(!g||g<1000){alert('Geçerli bir gelir gir.');return false;}obData.gelir=g; }
  if (step===4)  { var y=parseInt(document.getElementById('ob-yatirim').value);if(!y||y<100){alert('Geçerli bir yatırım tutarı gir.');return false;}obData.yatirim=y; }
  if (step===5)  { if(!obData.risk){alert('Risk toleransını seç.');return false;} }
  if (step===6)  { var e=parseInt(document.getElementById('ob-emek').value);if(!e||e<=obData.yas){alert('Hedef yaş şu anki yaşından büyük olmalı.');return false;}obData.emekYas=e; }
  if (step===7)  { obData.artis=parseInt(document.getElementById('ob-artis').value)||0; }
  if (step===8)  { if(obData.sigorta==='var'){var p=parseFloat(document.getElementById('sig-prim').value);if(!p||p<=0){alert('Prim tutarını gir.');return false;}obData.sigortaPrim=p;obData.sigortaPB=document.getElementById('sig-pb').value;} }
  return true;
}

function selectCard(el, group, val) {
  var parent=el.closest('.ob-card-list,.ob-cards');
  if(parent)parent.querySelectorAll('.ob-card,.ob-card-row').forEach(function(c){c.classList.remove('selected');});
  el.classList.add('selected');
  if(group==='meslek')obData.meslek=val;
  if(group==='risk')obData.risk=val;
}

function selectSigorta(val) {
  document.getElementById('sig-yok-card').classList.toggle('selected',val==='yok');
  document.getElementById('sig-var-card').classList.toggle('selected',val==='var');
  obData.sigorta=val;
  document.getElementById('sig-detay').style.display=val==='var'?'block':'none';
}

function updateSlider(type) {
  if(type==='yas'){var v=parseInt(document.getElementById('ob-yas').value);document.getElementById('yas-val').textContent=v+' yaş';var t=document.getElementById('ob-yas-txt');if(t)t.value=v;obData.yas=v;}
  if(type==='gelir'){var v=parseInt(document.getElementById('ob-gelir').value);document.getElementById('gelir-val').textContent=fmtR(v)+' ₺';document.getElementById('ob-gelir-txt').value=v;obData.gelir=v;}
  if(type==='yatirim'){var v=parseInt(document.getElementById('ob-yatirim').value);document.getElementById('yatirim-val').textContent=fmtR(v)+' ₺';document.getElementById('ob-yatirim-txt').value=v;obData.yatirim=v;var pct=obData.gelir>0?Math.round(v/obData.gelir*100):0;document.getElementById('yatirim-pct-sub').textContent='Gelirinizin %'+pct+"'i";var h=document.getElementById('yatirim-hint');if(pct>=30){h.style.background='var(--green-bg)';h.style.color='var(--green)';h.textContent='Harika! %'+pct+' tasarruf oranı.';}else if(pct>=20){h.style.background='var(--gold-bg)';h.style.color='var(--gold)';h.textContent='İyi! Minimum %20 hedefliyorsun.';}else{h.style.background='var(--red-bg)';h.style.color='var(--red)';h.textContent='Uzmanlar minimum %20 öneriyor.';}}
  if(type==='emek'){var v=parseInt(document.getElementById('ob-emek').value);document.getElementById('emek-val').textContent=v+' yaş';var t=document.getElementById('ob-emek-txt');if(t)t.value=v;obData.emekYas=v;document.getElementById('emek-kalan-sub').textContent=(v-obData.yas)+' yıl sonra';}
  if(type==='artis'){var v=parseInt(document.getElementById('ob-artis').value);document.getElementById('artis-val').textContent=v>0?'%'+v:'%0';var t=document.getElementById('ob-artis-txt');if(t)t.value=v;obData.artis=v;var s=document.getElementById('artis-sub');if(v===0){s.textContent='Sabit yatırımla devam';}else{var artisli=calcPortfoy(obData.yatirim,18,obData.emekYas-obData.yas,v),sabit=calcPortfoy(obData.yatirim,18,obData.emekYas-obData.yas,0);s.textContent='%'+v+' artışla +'+fmtR(artisli-sabit)+' ₺ fazla';}}
}

function syncManual(type,v) {
  var prevN=parseInt(v)||0;
  if(type==='yas'){
    document.getElementById('ob-yas').value=Math.max(18,Math.min(65,prevN));
    document.getElementById('yas-val').textContent=prevN+' yaş';
    obData.yas=prevN;
  }
  if(type==='gelir'){
    document.getElementById('ob-gelir').value=Math.max(20000,Math.min(500000,prevN));
    document.getElementById('gelir-val').textContent=fmtR(prevN)+' ₺';
    obData.gelir=prevN;
  }
  if(type==='yatirim'){
    document.getElementById('ob-yatirim').value=Math.max(500,Math.min(300000,prevN));
    document.getElementById('yatirim-val').textContent=fmtR(prevN)+' ₺';
    obData.yatirim=prevN;
    var pct=obData.gelir>0?Math.round(prevN/obData.gelir*100):0;
    var sub=document.getElementById('yatirim-pct-sub');
    if(sub)sub.textContent='Gelirinizin %'+pct+"'i";
    var h=document.getElementById('yatirim-hint');
    if(h){
      if(pct>=30){h.style.background='var(--green-bg)';h.style.color='var(--green)';h.textContent='Harika! %'+pct+' tasarruf oranı.';}
      else if(pct>=20){h.style.background='var(--gold-bg)';h.style.color='var(--gold)';h.textContent='İyi! Minimum %20 hedefliyorsun.';}
      else{h.style.background='var(--red-bg)';h.style.color='var(--red)';h.textContent='Uzmanlar minimum %20 öneriyor.';}
    }
  }
  if(type==='emek'){
    document.getElementById('ob-emek').value=Math.max(40,Math.min(70,prevN));
    document.getElementById('emek-val').textContent=prevN+' yaş';
    obData.emekYas=prevN;
    document.getElementById('emek-kalan-sub').textContent=(prevN-obData.yas)+' yıl sonra';
  }
  if(type==='artis'){
    document.getElementById('ob-artis').value=Math.max(0,Math.min(20,prevN));
    document.getElementById('artis-val').textContent=prevN>0?'%'+prevN:'%0';
    obData.artis=prevN;
    var s=document.getElementById('artis-sub');
    if(prevN===0){s.textContent='Sabit yatırımla devam';}
    else{var artisli=calcPortfoy(obData.yatirim,18,obData.emekYas-obData.yas,prevN),sabit=calcPortfoy(obData.yatirim,18,obData.emekYas-obData.yas,0);s.textContent='%'+prevN+' artışla +'+fmtR(artisli-sabit)+' ₺ fazla';}
  }
}

function updateSigortaHint() {
  var pb=document.getElementById('sig-pb').value;
  var prim=parseFloat(document.getElementById('sig-prim').value)||0;
  if(!prim){document.getElementById('sig-hint').style.display='none';return;}
  var primTL=pb==='usd'?prim*(S.rates.usd||44):pb==='eur'?prim*(S.rates.eur||50):prim;
  var iade=primTL*0.5*0.27;
  document.getElementById('sig-hint').style.display='block';
  document.getElementById('sig-hint').textContent='Tahmini yıllık vergi iadesi: ~'+fmtR(iade*12)+' ₺';
}

function buildSummary() {
  var kalan=obData.emekYas-obData.yas;
  var hedef=calcPortfoy(obData.yatirim,18,kalan,obData.artis);
  var aylik=Math.round(hedef*0.18/12);
  var rA={konser:'Muhafazakâr',dengeli:'Dengeli',agresif:'Agresif',katilim:'Katılım (Faizsiz)'};
  var mA={doktor:'Doktor/Hekim',ogretmen:'Öğretmen',muhendis:'Mühendis',memur:'Devlet Memuru',ozel:'Özel Sektör',serbest:'Serbest/Girişimci'};
  var sigStr=obData.sigorta==='var'?obData.sigortaPrim+' '+obData.sigortaPB.toUpperCase()+'/ay':'Yok';
  document.getElementById('ob-ozet').innerHTML=
    '<div class="ob-sum-row"><span class="ob-sum-lbl" style="display:flex;align-items:center;gap:4px;"><i data-lucide="user" class="lu"></i> Profil</span><span class="ob-sum-val">'+obData.ad+', '+obData.yas+' yaş</span></div>'+
    '<div class="ob-sum-row"><span class="ob-sum-lbl" style="display:flex;align-items:center;gap:4px;"><i data-lucide="briefcase" class="lu"></i> Meslek</span><span class="ob-sum-val">'+(mA[obData.meslek]||obData.meslek)+'</span></div>'+
    '<div class="ob-sum-row"><span class="ob-sum-lbl" style="display:flex;align-items:center;gap:4px;"><i data-lucide="coins" class="lu"></i> Aylık gelir</span><span class="ob-sum-val">'+fmtR(obData.gelir)+' ₺</span></div>'+
    '<div class="ob-sum-row"><span class="ob-sum-lbl" style="display:flex;align-items:center;gap:4px;"><i data-lucide="line-chart" class="lu"></i> Yatırım</span><span class="ob-sum-val" style="color:var(--green);">'+fmtR(obData.yatirim)+' ₺ (%'+Math.round(obData.yatirim/obData.gelir*100)+')</span></div>'+
    '<div class="ob-sum-row"><span class="ob-sum-lbl" style="display:flex;align-items:center;gap:4px;"><i data-lucide="scale" class="lu"></i> Risk</span><span class="ob-sum-val">'+(rA[obData.risk])+'</span></div>'+
    '<div class="ob-sum-row"><span class="ob-sum-lbl" style="display:flex;align-items:center;gap:4px;"><i data-lucide="crosshair" class="lu"></i> Hedef</span><span class="ob-sum-val">'+obData.emekYas+' yaş ('+kalan+' yıl)</span></div>'+
    (obData.artis>0?'<div class="ob-sum-row"><span class="ob-sum-lbl" style="display:flex;align-items:center;gap:4px;"><i data-lucide="trending-up" class="lu"></i> Artış</span><span class="ob-sum-val" style="color:var(--gold);">%'+obData.artis+'</span></div>':'')+
    '<div class="ob-sum-row"><span class="ob-sum-lbl" style="display:flex;align-items:center;gap:4px;"><i data-lucide="shield-check" class="lu"></i> Sigorta</span><span class="ob-sum-val">'+sigStr+'</span></div>';
  document.getElementById('ob-projeksiyon').innerHTML=
    '<div style="font-size:12px;font-weight:700;color:var(--gold);margin-bottom:6px;display:flex;align-items:center;gap:4px;"><i data-lucide="target" class="lu"></i> Tahminî Hedef Portföy</div>'+
    '<div style="font-family:var(--serif);font-size:28px;font-weight:700;color:var(--gold);margin-bottom:8px;">'+fmtR(hedef)+' ₺</div>'+
    '<div style="font-size:12px;color:var(--ink2);">Bu portföyle aylık <strong>'+fmtR(aylik)+' ₺</strong> pasif gelir (anapara korunarak, %18 getiri).</div>';
}

function finalizeOnboarding() {
  // Benzersiz ID ile kayıt — aynı isimli profiller ayrı kalır
  var yeniId = 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2,6);
  P = { id:yeniId, ad:obData.ad, yas:obData.yas, meslek:obData.meslek,
    gelir:obData.gelir, yatirim:obData.yatirim, risk:obData.risk,
    emekYas:obData.emekYas, artis:obData.artis,
    sigorta:obData.sigorta, sigortaPrim:obData.sigortaPrim, sigortaPB:obData.sigortaPB,
    olusturulma: new Date().toLocaleDateString('tr-TR') };
  TUM_PROFILLER.push(P);
  try{ localStorage.setItem('mn-profiller',JSON.stringify(TUM_PROFILLER)); }catch(e){}
  S.yatirim=P.yatirim; S.maas=P.gelir; S.araclar=getDefaultAraclar(P.risk);
  S.bordrolar=[]; S.bakiye=[]; S.alarmlar=[]; S.alarmGecmis=[];
  S.giderler=[]; S.tekrarlayan=[]; S.butce={};
  S.dismissedInsights=[]; S.achievements={}; S.streaks={tasarruf:0,butce:0,giris:0}; S.goals=[];
  if(P.sigorta==='var')S.sigortaBaslangic=new Date().toISOString();
  saveState();
  GIZLI=false;
  document.getElementById('onboarding').classList.remove('visible');
  document.getElementById('dashboard').classList.add('visible');
  resetTabToPortfolio();
  document.querySelectorAll('.stat').forEach(function(s){s.classList.add('skeleton-active');});
  initDashboard();
  fetchRates().finally(function(){
    document.querySelectorAll('.stat.skeleton-active').forEach(function(s){s.classList.remove('skeleton-active');});
  });
  if(rateInterval)clearInterval(rateInterval);
  rateInterval=setInterval(fetchRates,30000);
  setTimeout(initScrollHints, 300);
  setTimeout(initPullToRefresh, 500);
  showToast('Profilin oluşturuldu!','success',3000);
  // Start tour after layout settles for new profiles
  setTimeout(function(){ if(typeof startTour==='function') startTour(); }, 3000);
}