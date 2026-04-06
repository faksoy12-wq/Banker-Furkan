// ── DAĞILIM ───────────────────────────────────────────────────────────────
var ARAC_FN={altin:function(){return S.rates.altin||7100;},usd:function(){return S.rates.usd||44;},ppf:function(){return 1;},bist:function(){return 1;},katfon:function(){return 1;},katilim30:function(){return 1;},diger:function(){return 1;}};

function renderDagılım(){
  if(!S.araclar||!S.araclar.length)S.araclar=getDefaultAraclar(P.risk||'dengeli');
  var c=document.getElementById('dagılım-satirlar');if(!c)return;
  c.innerHTML=S.araclar.map(function(a){
    var t=Math.round(S.yatirim*a.oran/100),extra='';
    if(a.aciklama==='gram'&&S.rates.altin&&!GIZLI)extra=(t/S.rates.altin).toFixed(2)+' gram alınır';
    else if(a.aciklama==='usd'&&S.rates.usd&&!GIZLI)extra='~'+Math.round(t/S.rates.usd)+' USD';
    else if(a.aciklama==='faiz')extra='Günlük ~%0.10 faiz';
    else if(a.aciklama==='karpay')extra='Günlük kâr payı dağıtımı';
    return '<div class="arow"><div class="adot" style="background:'+a.renk+';"></div>'+
      '<div class="an"><div class="an-m">'+a.ad+'</div><div class="an-s">'+a.platform+(extra?' · '+extra:'')+'</div></div>'+
      '<div class="abw"><div class="ab" style="width:'+Math.min(a.oran,100)+'%;background:'+a.renk+';"></div></div>'+
      '<div class="ap">%'+a.oran+'</div>'+
      '<div class="aa" style="color:'+a.renk+';">'+fmtN(t)+' ₺</div></div>';
  }).join('');
}

function renderAracListe(){var c=document.getElementById('arac-liste');if(!c)return;c.innerHTML=S.araclar.map(function(a,i){return'<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border);"><div style="width:12px;height:12px;border-radius:50%;background:'+a.renk+';flex-shrink:0;"></div><div style="flex:1;font-size:13px;font-weight:500;">'+a.ad+'</div><div style="display:flex;align-items:center;gap:4px;"><span style="font-size:12px;color:var(--ink3);">%</span><input type="number" value="'+a.oran+'" min="0" max="100" step="1" style="width:52px;padding:4px 6px;border:1px solid var(--border);border-radius:6px;font-size:16px;font-weight:600;text-align:center;font-family:var(--sans);" oninput="oranGuncelle('+i+',this.value)"></div><button onclick="aracSil('+i+')" style="font-size:18px;background:none;border:none;cursor:pointer;color:var(--ink3);padding:0 4px;">×</button></div>';}).join('');toplamGoster();}
function oranGuncelle(i,v){S.araclar[i].oran=parseInt(v)||0;toplamGoster();}
function toplamGoster(){var t=S.araclar.reduce(function(s,a){return s+a.oran;},0);var el=document.getElementById('toplam-oran-uyari');if(!el)return;el.style.display='block';if(t===100){el.style.background='var(--green-bg)';el.style.color='var(--green)';el.textContent='✓ Toplam: %100';}else if(t<100){el.style.background='var(--gold-bg)';el.style.color='var(--gold)';el.textContent='⚠ %'+t+' — '+(100-t)+'% eksik';}else{el.style.background='var(--red-bg)';el.style.color='var(--red)';el.textContent='✗ %'+t+' — '+(t-100)+'% fazla';}}
function aracEkle(ad,renk,oran){S.araclar.push({id:'ozel_'+Date.now(),ad:ad,renk:renk,oran:parseInt(oran),platform:'Ziraat → Yatırım',aciklama:''});renderAracListe();}
function aracSil(i){if(S.araclar.length<=1){showToast('En az 1 araç olmalı','warning');return;}S.araclar.splice(i,1);renderAracListe();}
function toggleAracDuzenle(){var n=document.getElementById('dagılım-normal'),d=document.getElementById('dagılım-duzenle'),b=document.getElementById('arac-btn');if(d.style.display==='none'){d.style.display='block';n.style.display='none';b.textContent='✕ Kapat';renderAracListe();}else dagılımIptal();}
function dagılımKaydet(){var t=S.araclar.reduce(function(s,a){return s+a.oran;},0);if(t!==100){showToast('Toplam %100 olmalı! Şu an: %'+t,'warning');return;}saveState();renderDagılım();updateAll();buildTimeline();renderHedef();buildAksiyon();dagılımIptal();cu();showToast('Yatırım dağılımı güncellendi','success');}
function dagılımIptal(){try{var st=JSON.parse(localStorage.getItem('mn-state-'+P.id)||'{}');if(st.araclar)S.araclar=st.araclar;else S.araclar=getDefaultAraclar(P.risk||'dengeli');}catch(e){S.araclar=getDefaultAraclar(P.risk||'dengeli');}document.getElementById('dagılım-duzenle').style.display='none';document.getElementById('dagılım-normal').style.display='block';document.getElementById('arac-btn').textContent='✏️ Düzenle';}