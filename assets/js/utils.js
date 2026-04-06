function haptic(){try{if(navigator.vibrate)navigator.vibrate(50);}catch(e){}}

// ── GİZLİLİK (Privacy Mask) ───────────────────────────────────────────────
var GIZLI = false; try{ GIZLI = localStorage.getItem('mn-gizli')==='1'; }catch(e){}
function maskVal(v) { return GIZLI ? '••••••' : v; }
function toggleGizlilik() {
  GIZLI = !GIZLI;
  try{ localStorage.setItem('mn-gizli', GIZLI ? '1' : '0'); }catch(e){}
  var btn = document.getElementById('gizlilik-btn');
  if (btn) btn.innerHTML = GIZLI ? '<i data-lucide="eye-off" class="lu"></i>' : '<i data-lucide="eye" class="lu"></i>';
  if(typeof lucide!=='undefined') lucide.createIcons();
  updateAll();
  renderBakiye();
  renderHedef();
  renderHistory();
}

function toggleStepperPanel(panelId) {
  var panel = document.getElementById(panelId);
  if (panel) panel.classList.toggle('open');
}

// ── XSS PROTECTION ───────────────────────────────────────────────────────
function esc(str) {
  if (str === null || str === undefined) return '';
  var div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

// ── TOAST NOTIFICATIONS ──────────────────────────────────────────────────
function showToast(message, type, duration) {
  type = type || 'info';
  duration = duration || 3500;
  var container = document.getElementById('toast-container');
  if (!container) return;
  var icons = {success:'✓',error:'✕',warning:'⚠',info:'ℹ'};
  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.innerHTML = '<span class="toast-icon">' + (icons[type]||'ℹ') + '</span><span class="toast-msg">' + esc(message) + '</span><button class="toast-close" onclick="this.parentElement.classList.add(\'toast-out\');setTimeout(function(){this.parentElement.remove();}.bind(this),300);">×</button>';
  container.appendChild(toast);
  // Auto remove
  setTimeout(function() {
    if (toast.parentNode) {
      toast.classList.add('toast-out');
      setTimeout(function() { if (toast.parentNode) toast.remove(); }, 300);
    }
  }, duration);
  // Max 4 toasts
  while (container.children.length > 4) { container.removeChild(container.firstChild); }
}

// ── FORMAT ────────────────────────────────────────────────────────────────
var fmtN = function(n){ return maskVal(Math.round(n).toLocaleString('tr-TR')); };
var fmt  = function(n){ if (GIZLI) return '••••••'; return n>=1e9?(n/1e9).toFixed(2)+' Milyar ₺':n>=1e6?(n/1e6).toFixed(1)+' Milyon ₺':n>=1e3?(n/1e3).toFixed(0)+'K ₺':Math.round(n).toLocaleString('tr-TR')+' ₺'; };
var fmtR = function(n){ return Math.round(n).toLocaleString('tr-TR'); }; // Raw (maskelenmez)
var fs   = function(n){ return n>=1e9?(n/1e9).toFixed(1)+'Mr':n>=1e6?(n/1e6).toFixed(0)+'M':n>=1e3?(n/1e3).toFixed(0)+'K':Math.round(n); };

// ── DARK MODE ────────────────────────────────────────────────────────────
function toggleTheme(){
  var html=document.documentElement;
  var isDark=html.getAttribute('data-theme')==='dark';
  html.setAttribute('data-theme',isDark?'light':'dark');
  var btn=document.getElementById('theme-btn');
  if(btn)btn.innerHTML=isDark?'<i data-lucide="moon" class="lu"></i>':'<i data-lucide="sun" class="lu"></i>';
  if(typeof lucide!=='undefined') lucide.createIcons();
  try{localStorage.setItem('mn-theme',isDark?'light':'dark');}catch(e){}
  // Chart.js renk güncelle
  if(typeof cc!=='undefined'&&cc)try{cu();}catch(e){}
  // Gider chart'ları tema renklerini kullandığı için yeniden render
  try{renderGiderCharts();}catch(e){}
}
function initTheme(){
  var saved;try{saved=localStorage.getItem('mn-theme');}catch(e){}
  if(!saved){saved=window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';}
  document.documentElement.setAttribute('data-theme',saved);
  var btn=document.getElementById('theme-btn');
  if(btn){ btn.innerHTML=saved==='dark'?'<i data-lucide="sun" class="lu"></i>':'<i data-lucide="moon" class="lu"></i>'; if(typeof lucide!=='undefined')lucide.createIcons(); }
}

// ── EXPORT / IMPORT ──────────────────────────────────────────────────────
function exportData(){
  if(!P.id){alert('Önce bir profil seçin.');return;}
  var data={profiller:TUM_PROFILLER,aktifProfil:P,state:{yatirim:S.yatirim,maas:S.maas,brut:S.brut,vergiBrut:S.vergiBrut,bordro:S.bordrolar,bakiye:S.bakiye,araclar:S.araclar,alarmlar:S.alarmlar,alarmGecmis:S.alarmGecmis,sigortaBaslangic:S.sigortaBaslangic,giderler:S.giderler||[]},tarih:new Date().toISOString(),versiyon:'2.1'};
  var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download='mangir-yedek-'+new Date().toISOString().slice(0,10)+'.json';
  a.click();URL.revokeObjectURL(a.href);
}

function importData(event){
  var file=event.target.files[0];if(!file)return;
  var reader=new FileReader();
  reader.onload=function(e){
    try{
      var data=JSON.parse(e.target.result);
      if(!data.profiller||!data.state){alert('Geçersiz yedek dosyası.');return;}
      if(!confirm('Mevcut veriler üzerine yazılacak. Devam?'))return;
      TUM_PROFILLER=data.profiller;
      try{localStorage.setItem('mn-profiller',JSON.stringify(TUM_PROFILLER));}catch(ex){}
      if(data.aktifProfil){
        P=data.aktifProfil;
        S.yatirim=data.state.yatirim||P.yatirim;
        S.maas=data.state.maas||P.gelir;
        S.bordrolar=data.state.bordro||[];
        S.bakiye=data.state.bakiye||[];
        S.araclar=data.state.araclar||getDefaultAraclar(P.risk||'dengeli');
        S.alarmlar=data.state.alarmlar||[];
        S.alarmGecmis=data.state.alarmGecmis||[];
        S.sigortaBaslangic=data.state.sigortaBaslangic||null;
        S.giderler=data.state.giderler||[];
        saveState();
      }
      alert('✓ Yedek başarıyla yüklendi!');
      location.reload();
    }catch(ex){alert('Dosya okunamadı: '+ex.message);}
  };
  reader.readAsText(file);
  event.target.value='';
}

// ── SCROLL HINT SYSTEM ───────────────────────────────────────────────────
function initScrollHints() {
  // ─── Top nav scroll detection ───
  var topNav = document.getElementById('top-nav');
  var navContainer = document.getElementById('nav-container');
  var navHint = document.getElementById('nav-scroll-hint');

  if (topNav && navContainer) {
    function updateTopNavScroll() {
      var sl = topNav.scrollLeft;
      var maxScroll = topNav.scrollWidth - topNav.clientWidth;
      navContainer.classList.remove('scroll-start', 'scroll-end', 'scroll-middle');
      if (maxScroll <= 2) {
        navContainer.classList.add('scroll-end');
        if (navHint) navHint.classList.add('hidden');
      } else if (sl <= 2) {
        navContainer.classList.add('scroll-start');
      } else if (sl >= maxScroll - 2) {
        navContainer.classList.add('scroll-end');
      } else {
        navContainer.classList.add('scroll-middle');
      }
      // Hide hint arrow once user scrolls
      if (navHint && sl > 10) {
        navHint.classList.add('hidden');
      }
    }
    topNav.addEventListener('scroll', updateTopNavScroll, { passive: true });
    setTimeout(updateTopNavScroll, 100);
    // Auto-hide hint arrow after 6 seconds
    if (navHint) {
      setTimeout(function() { navHint.classList.add('hidden'); }, 6000);
    }
  }

  // ─── Bottom nav scroll detection ───
  var bottomInner = document.getElementById('bottom-nav-inner');
  var bottomNav = document.getElementById('bottom-nav');
  var bnavHint = document.getElementById('bnav-scroll-hint');
  var swipeTooltip = document.getElementById('swipe-hint-tooltip');

  if (bottomInner && bottomNav) {
    function updateBottomNavScroll() {
      var sl = bottomInner.scrollLeft;
      var maxScroll = bottomInner.scrollWidth - bottomInner.clientWidth;
      bottomNav.classList.remove('bnav-scroll-start', 'bnav-scroll-end', 'bnav-scroll-middle');
      if (maxScroll <= 2) {
        bottomNav.classList.add('bnav-scroll-end');
        if (bnavHint) bnavHint.classList.add('hidden');
      } else if (sl <= 2) {
        bottomNav.classList.add('bnav-scroll-start');
      } else if (sl >= maxScroll - 2) {
        bottomNav.classList.add('bnav-scroll-end');
      } else {
        bottomNav.classList.add('bnav-scroll-middle');
      }
      // Hide hint chevrons once user scrolls
      if (bnavHint && sl > 10) {
        bnavHint.classList.add('hidden');
      }
    }
    bottomInner.addEventListener('scroll', updateBottomNavScroll, { passive: true });
    setTimeout(updateBottomNavScroll, 200);

    // Auto-hide bottom hint arrow after 6 seconds
    if (bnavHint) {
      setTimeout(function() { bnavHint.classList.add('hidden'); }, 6000);
    }

    // Show tooltip only once per user
    if (swipeTooltip) {
      var hintShown = false;
      try { hintShown = localStorage.getItem('mn-swipe-hint-shown') === '1'; } catch(e) {}
      if (hintShown) {
        swipeTooltip.style.display = 'none';
      } else {
        // Mark as shown after animation completes
        setTimeout(function() {
          try { localStorage.setItem('mn-swipe-hint-shown', '1'); } catch(e) {}
        }, 5500);
        // Remove tooltip completely after it fades
        setTimeout(function() {
          if (swipeTooltip.parentNode) swipeTooltip.style.display = 'none';
        }, 6000);
      }
    }
  }
}

// ── PULL TO REFRESH ──────────────────────────────────────────────────────
var ptrStartY=0,ptrActive=false,ptrDone=false;
function initPullToRefresh(){
  var db=document.getElementById('dashboard');
  if(!db)return;
  db.addEventListener('touchstart',function(e){
    if(window.scrollY<=5){ptrStartY=e.touches[0].clientY;ptrActive=true;ptrDone=false;}
  },{passive:true});
  db.addEventListener('touchmove',function(e){
    if(!ptrActive)return;
    var diff=e.touches[0].clientY-ptrStartY;
    if(diff>0&&window.scrollY<=5){
      var pull=Math.min(diff*0.4,70);
      var wrap=document.getElementById('ptr-wrap');
      var ind=document.getElementById('ptr-indicator');
      if(wrap)wrap.style.transform='translateY('+(pull-60)+'px)';
      if(ind)ind.style.transform='rotate('+(pull*4)+'deg)';
      if(pull>=55)ptrDone=true;
    }
  },{passive:true});
  db.addEventListener('touchend',function(){
    if(!ptrActive)return;
    ptrActive=false;
    var wrap=document.getElementById('ptr-wrap');
    var ind=document.getElementById('ptr-indicator');
    if(ptrDone){
      if(ind)ind.classList.add('spinning');
      haptic();
      fetchRates().finally(function(){
        if(wrap)wrap.style.transform='translateY(-60px)';
        if(ind){ind.classList.remove('spinning');ind.style.transform='';}
        showToast('Kurlar güncellendi ✓','success',2000);
      });
    }else{
      if(wrap)wrap.style.transform='translateY(-60px)';
      if(ind)ind.style.transform='';
    }
  },{passive:true});
}