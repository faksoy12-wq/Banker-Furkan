// ── DASHBOARD INIT ────────────────────────────────────────────────────────
function getDefaultAraclar(risk) {
  if(risk==='konser')return[{id:'ppf',ad:' Para Piyasası Fonu',renk:'#1A7A4A',oran:50,platform:'Ziraat → ZPP',aciklama:'faiz'},{id:'altin',ad:' Gram Altın',renk:'#C9A84C',oran:30,platform:'Ziraat → Altın',aciklama:'gram'},{id:'usd',ad:' Döviz (USD)',renk:'#7B3FBE',oran:20,platform:'Ziraat → Döviz',aciklama:'usd'}];
  if(risk==='agresif')return[{id:'bist',ad:' BİST 30',renk:'#1A5FAA',oran:40,platform:'Ziraat → Endeks',aciklama:''},{id:'altin',ad:' Gram Altın',renk:'#C9A84C',oran:35,platform:'Ziraat → Altın',aciklama:'gram'},{id:'ppf',ad:' Para Piy. Fonu',renk:'#1A7A4A',oran:15,platform:'Ziraat → ZPP',aciklama:'faiz'},{id:'usd',ad:' Döviz (USD)',renk:'#7B3FBE',oran:10,platform:'Ziraat → Döviz',aciklama:'usd'}];
  if(risk==='katilim')return[{id:'altin',ad:' Gram Altın',renk:'#C9A84C',oran:40,platform:'Katılım Bankası → Altın',aciklama:'gram'},{id:'katfon',ad:' Katılım Fonu',renk:'#1A7A4A',oran:30,platform:'Katılım Bankası → Fon',aciklama:'karpay'},{id:'katilim30',ad:' Katılım 30',renk:'#1A5FAA',oran:20,platform:'Katılım Bankası → Endeks',aciklama:''},{id:'usd',ad:' Döviz (USD)',renk:'#7B3FBE',oran:10,platform:'Katılım Bankası → Döviz',aciklama:'usd'}];
  return[{id:'altin',ad:' Gram Altın',renk:'#C9A84C',oran:45,platform:'Ziraat → Altın',aciklama:'gram'},{id:'ppf',ad:' Para Piy. Fonu',renk:'#1A7A4A',oran:30,platform:'Ziraat → ZPP',aciklama:'faiz'},{id:'bist',ad:' BİST 30',renk:'#1A5FAA',oran:15,platform:'Ziraat → Endeks',aciklama:''},{id:'usd',ad:' Döviz (USD)',renk:'#7B3FBE',oran:10,platform:'Ziraat → Döviz',aciklama:'usd'}];
}

function initDashboard() {
  var mA={doktor:'Doktor/Hekim',ogretmen:'Öğretmen',muhendis:'Mühendis',memur:'Devlet Memuru',ozel:'Özel Sektör Çalışanı',serbest:'Girişimci'};
  var kalan=P.emekYas-P.yas, pct=Math.round(P.yatirim/P.gelir*100);
  document.getElementById('d-isim').textContent=P.ad;
  document.getElementById('d-meslek').textContent=(mA[P.meslek]||P.meslek)+' · Finansal Özgürlük Planı';
  document.getElementById('d-yas-pill').textContent=P.yas+' yaş · '+P.emekYas+"'a "+kalan+' yıl';
  document.getElementById('d-tasarruf-pill').textContent='%'+pct+' tasarruf';

  // Gizlilik butonu ikonunu güncelle
  var gbtn=document.getElementById('gizlilik-btn');
  if(gbtn) { gbtn.innerHTML=GIZLI ? '<i data-lucide="eye-off" class="lu"></i>' : '<i data-lucide="eye" class="lu"></i>'; if(typeof lucide!=='undefined')lucide.createIcons(); }

  document.getElementById('s-maas').textContent=fmtN(P.gelir)+' ₺';
  document.getElementById('s-yatirim').textContent=fmtN(S.yatirim)+' ₺';
  document.getElementById('s-oran').textContent="Gelirin %"+pct+"'i yatırıma";
  var rA={konser:'Muhafazakâr',dengeli:'Dengeli',agresif:'Agresif',katilim:'Katılım'};
  document.getElementById('s-risk').textContent=rA[P.risk]||P.risk;
  document.getElementById('s-risk-sub').textContent=kalan+' yıl planlama';
  document.getElementById('c-m').value=S.yatirim;
  document.getElementById('c-y').value=kalan;
  document.getElementById('c-inc').value=P.artis||0;
  buildYasStrateji(); buildSenaryolar(); buildTimeline(); buildAksiyon();
  var aylar=["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
  var opts=[]; var now=new Date();
  for(var y=2024;y<=2060;y++){for(var m=0;m<12;m++){var sel=(y===now.getFullYear()&&m===now.getMonth())?' selected':'';opts.push('<option value="'+aylar[m]+' '+y+'"'+sel+'>'+aylar[m]+' '+y+'</option>');}}
  document.getElementById('f-ay').innerHTML=opts.join('');
  renderAlarmListe(); renderAlarmGecmis(); bildirimBannerKontrol();
  try{var mg=JSON.parse(localStorage.getItem('mn-maas-'+(P.id||P.ad))||'null');if(mg){document.getElementById('maas-gun').value=mg.gun;document.getElementById('maas-hatir').value=mg.hatirlatma||0;}}catch(e){}
  updateSigortaDetay(); renderDagılım(); renderBakiye(); renderHistory(); cu();
  setTimeout(function(){
    applyRecurring(); renderRecur(); renderBudget(); calculateHealthScore();
    if(typeof renderInsights==='function') renderInsights();
    if(typeof checkAchievements==='function') checkAchievements();
    if(typeof renderAchievementGallery==='function') renderAchievementGallery();
    if(typeof renderGoals==='function') renderGoals();
    if(typeof updateStreaks==='function') updateStreaks();
  }, 150);
}

function buildYasStrateji() {
  var d=document.getElementById('yas-edit-val');if(d)d.textContent=P.yas||27;
  var d2=document.getElementById('yas-edit-val2');if(d2)d2.textContent=P.yas||27;
  var yas=P.yas||27, emek=P.emekYas||55;
  var h=emek-18;if(h<0)h=0;
  var p1=18+Math.floor(h*0.4), p2=p1+Math.floor(h*0.3), p3=p2+Math.floor(h*0.2);
  var strats=[
    {range:'18–'+p1,desc:'Altın/Hisse ağır, agresif büyüme',c:yas>=18&&yas<p1},
    {range:p1+'–'+p2,desc:'BİST artır, fonlara geçiş',c:yas>=p1&&yas<p2},
    {range:p2+'–'+p3,desc:'BES başlat, denge kur',c:yas>=p2&&yas<p3},
    {range:p3+'–'+emek,desc:'BES maksimize, korumaya geç',c:yas>=p3&&yas<emek},
    {range:emek+'+',desc:'Finansal özgürlük, pasif gelir',c:yas>=emek}
  ];
  document.getElementById('yas-strateji').innerHTML=strats.map(function(s){
    return '<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--border);">'+
      '<div style="display:flex;align-items:center;gap:8px;"><div style="width:8px;height:8px;border-radius:50%;background:'+(s.c?'var(--green)':'#DDD')+';flex-shrink:0;"></div>'+
      '<span style="font-size:12px;'+(s.c?'font-weight:700;color:var(--green);':'color:var(--ink3);')+'">'+s.range+' yaş</span></div>'+
      '<span style="font-size:11px;color:'+(s.c?'var(--green)':'var(--ink3)')+';">'+s.desc+'</span></div>';
  }).join('');
}

function changeMevcutYas(dif){
  var y=P.yas||27; y+=dif;
  if(y<18||y>=(P.emekYas||55))return;
  P.yas=y; S.yas=y;
  var idx=TUM_PROFILLER.findIndex(function(x){return x.id===P.id;});
  if(idx>=0){TUM_PROFILLER[idx]=P;try{localStorage.setItem('mn-profiller',JSON.stringify(TUM_PROFILLER));}catch(e){}}
  var v1=document.getElementById('yas-edit-val');if(v1)v1.textContent=y;
  var v2=document.getElementById('yas-edit-val2');if(v2)v2.textContent=y;
  saveState(); updateAll(); buildYasStrateji(); buildSenaryolar(); buildTimeline(); renderHedef(); buildAksiyon(); if(typeof cu==='function')cu();
}

function changeEmekYas(dif){
  var y=P.emekYas||55; y+=dif;
  if(y<=(P.yas||27)||y>80)return;
  P.emekYas=y; S.emekYas=y;
  var idx=TUM_PROFILLER.findIndex(function(x){return x.id===P.id;});
  if(idx>=0){TUM_PROFILLER[idx]=P;try{localStorage.setItem('mn-profiller',JSON.stringify(TUM_PROFILLER));}catch(e){}}
  var v1=document.getElementById('emek-edit-val');if(v1)v1.textContent=y;
  var v2=document.getElementById('emek-edit-val2');if(v2)v2.textContent=y;
  saveState(); updateAll(); buildYasStrateji(); buildSenaryolar(); buildTimeline(); renderHedef(); buildAksiyon(); if(typeof cu==='function')cu();
}

function buildSenaryolar() {
  var d=document.getElementById('emek-edit-val');if(d)d.textContent=P.emekYas||55;
  var d2=document.getElementById('emek-edit-val2');if(d2)d2.textContent=P.emekYas||55;
  var kalan=(P.emekYas||55)-(P.yas||27);
  var p=document.getElementById('d-yas-pill');if(p)p.textContent=(P.yas||27)+' yaş · '+(P.emekYas||55)+"'a "+kalan+' yıl';
  document.getElementById('senaryo-cards').innerHTML=[{lbl:'Kötümser',g:12,rk:'var(--red)',bg:'var(--red-bg)',bd:'var(--red-bd)'},{lbl:'Gerçekçi ✓',g:18,rk:'var(--green)',bg:'var(--green-bg)',bd:'var(--green-bd)',b:true},{lbl:'İyimser',g:25,rk:'var(--blue)',bg:'var(--blue-bg)',bd:'var(--blue-bd)'}].map(function(s){var v=calcPortfoy(S.yatirim,s.g,kalan,P.artis||0);return'<div style="background:'+s.bg+';border:1px solid '+s.bd+';border-radius:8px;padding:10px 12px;display:flex;justify-content:space-between;align-items:center;"><div><div style="font-size:10px;font-weight:700;color:'+s.rk+';margin-bottom:2px;">'+s.lbl+'</div><div style="font-size:10px;color:var(--ink3);">%'+s.g+' yıllık</div></div><div style="font-size:'+(s.b?'15':'13')+'px;font-weight:700;color:'+s.rk+';">'+fmt(v)+'</div></div>';}).join('');
}

function buildTimeline() {
  if(!P.yas)return;
  var yas=P.yas,hYas=P.emekYas||55,yil=hYas-yas,aylik=S.yatirim,artis=P.artis||0;
  document.getElementById('yh-simdi-yas').textContent=yas;
  document.getElementById('yh-simdi-sub').textContent=yil+' yıl var';
  document.getElementById('yh-hedef-yas').textContent=hYas;
  document.getElementById('yh-aylik').textContent=fmtN(aylik)+' ₺';
  var tlData=[
    {age:'Şimdi',t:'Başlangıç — Bu Hafta',d:'Ziraat altın hesabı aç · ZPP ve BİST 30 Endeks Fonu al · Sigorta makbuzunu İK\'ya ilet',v:fmtN(aylik)+' ₺/ay'},
    {age:(yas+3)+' yaş',t:'İlk Milestone',d:'Portföy büyüdü. Aylık yatırımı artırmayı değerlendir.',v:fmt(calcPortfoy(aylik,18,3,artis))},
    {age:(yas+8)+' yaş',t:'Strateji Gözden Geçir',d:'BİST ağırlığını artır · Gönüllü BES başlat.',v:fmt(calcPortfoy(aylik,18,8,artis))},
    {age:Math.round(yas+yil*0.5)+' yaş',t:'Yarı Yol',d:'Bileşik getiri hızlanıyor. Gelir artışını yatırıma yansıt.',v:fmt(calcPortfoy(aylik,18,Math.round(yil*0.5),artis))},
    {age:(hYas-5)+' yaş',t:'Koruma Modu',d:'Riskli varlıkları azalt · BES\'i maksimize et.',v:fmt(calcPortfoy(aylik,18,yil-5,artis))},
    {age:hYas+' yaş',fin:true,t:'Finansal Özgürlük',d:'Çalışmak zorunluluk değil tercih. Portföy her ay gelir üretir.',v:fmt(calcPortfoy(aylik,18,yil,artis))},
  ];
  document.getElementById('tl-list').innerHTML=tlData.map(function(t){
    var bg=t.fin?'var(--gold-bg)':'#F2F2F7',cl=t.fin?'var(--gold)':'var(--ink3)';
    return '<div class="tl"><div class="tl-b" style="background:'+bg+';color:'+cl+';">'+t.age+'</div><div><div class="tl-t">'+t.t+'</div><div class="tl-d">'+t.d+'</div><div class="tl-a">'+t.v+'</div></div></div>';
  }).join('');
}

var DONE_STATE={};
function buildAksiyon() {
  if(!P.id)return;
  try{DONE_STATE=JSON.parse(localStorage.getItem('mn-done-'+P.id)||'{}');}catch(e){}
  var actions=[{id:'a1',emoji:'<i data-lucide="building" class="lu"></i>',t:'Ziraat → Altın Hesabı Aç',d:'2 dakika. Miktar gir, satın al.'},{id:'a2',emoji:'<i data-lucide="pie-chart" class="lu"></i>',t:'Ziraat → Fon → ZPP',d:'Para Piyasası Fonu. Günlük faiz.'},{id:'a3',emoji:'<i data-lucide="trending-up" class="lu"></i>',t:'Ziraat → Fon → BİST 30',d:'Al, unut. Takip etmen gerekmiyor.'},{id:'a4',emoji:'<i data-lucide="dollar-sign" class="lu"></i>',t:'Ziraat → Fon → Döviz',d:'Kur koruması + faiz.'},{id:'a5',emoji:'<i data-lucide="receipt" class="lu"></i>',t:'Sigorta makbuzunu İK\'ya ilet',d:'Her ay tekrar et.'}];
  document.getElementById('act-list').innerHTML=actions.map(function(a){var done=DONE_STATE[a.id];return'<div class="act"><div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;background:var(--gold-bg);border:1px solid var(--gold-bd);color:var(--gold);">'+a.emoji+'</div><div style="flex:1;"><div style="font-size:13px;font-weight:600;margin-bottom:2px;'+(done?'text-decoration:line-through;opacity:.5;':'')+'">'+a.t+'</div><div style="font-size:11px;color:var(--ink3);line-height:1.5;">'+a.d+'</div><button class="done-btn '+(done?'done':'')+'" onclick="toggleDone(\''+a.id+'\')"> '+(done?'✓ Tamamlandı':'İşaretle')+'</button></div></div>';}).join('');
  if(typeof lucide!=='undefined')lucide.createIcons();
  var aylikHtml='';
  S.araclar.forEach(function(a){aylikHtml+='<div class="arow"><div class="adot" style="background:'+a.renk+';"></div><div class="an"><div class="an-m">'+a.ad+'</div></div><div class="aa" style="color:'+a.renk+';">'+fmtN(Math.round(S.yatirim*a.oran/100))+' ₺</div></div>';});
  document.getElementById('act-aylik').innerHTML=aylikHtml;
}

function toggleDone(id) {
  DONE_STATE[id]=!DONE_STATE[id];
  try{localStorage.setItem('mn-done-'+P.id,JSON.stringify(DONE_STATE));}catch(e){}
  buildAksiyon();
}

// ── SİGORTA ───────────────────────────────────────────────────────────────
function getSigortaPrimTL(){if(!P||P.sigorta!=='var')return 0;var p=P.sigortaPrim||0,pb=P.sigortaPB||'tl';if(pb==='usd')return p*(S.rates.usd||44);if(pb==='eur')return p*(S.rates.eur||50);return p;}
function getSigortaAylikIade(){var primTL=getSigortaPrimTL(),oran=vergiBelirleGercek(S.brut,S.vergiBrut);return Math.round(primTL*0.5*oran);}
function getSigortaToplamBirikim(){if(!P||P.sigorta!=='var'||!S.sigortaBaslangic)return 0;var b=new Date(S.sigortaBaslangic),s=new Date();var ay=Math.max(0,(s.getFullYear()-b.getFullYear())*12+(s.getMonth()-b.getMonth()));return Math.round(getSigortaPrimTL()*ay);}

function updateSigortaDetay() {
  var el=document.getElementById('v-sigorta-detay');if(!el)return;
  if(!P||P.sigorta!=='var'){el.innerHTML='<div style="font-size:12px;color:var(--ink3);padding:10px 0;text-align:center;">Sigortanız yok. Aşağıdan ekleyin.</div>';document.getElementById('v-yillik').textContent='—';document.getElementById('v-toplam').textContent='~4.500 ₺';return;}
  var primTL=getSigortaPrimTL(),oran=vergiBelirleGercek(S.brut,S.vergiBrut),aiade=getSigortaAylikIade(),yiade=aiade*12,pb=P.sigortaPB==='usd'?'$':P.sigortaPB==='eur'?'€':'₺';
  el.innerHTML='<div class="tx-r"><span style="color:var(--ink2);">Aylık prim (orijinal)</span><span style="font-weight:600;">'+fmtN(P.sigortaPrim)+' '+pb+'</span></div>'+
    '<div class="tx-r"><span style="color:var(--ink2);">TL karşılığı</span><span style="font-weight:600;">'+fmtN(primTL)+' ₺</span></div>'+
    '<div class="tx-r"><span style="color:var(--ink2);">İndirim (%50)</span><span style="font-weight:600;">'+fmtN(primTL*0.5)+' ₺/ay</span></div>'+
    '<div class="tx-r"><span style="color:var(--ink2);">Vergi dilimi</span><span style="font-weight:700;color:var(--red);">%'+Math.round(oran*100)+'</span></div>'+
    '<div class="tx-r"><span style="color:var(--ink2);">Aylık iade</span><span class="tx-v">~'+fmtN(aiade)+' ₺</span></div>'+
    '<div class="tx-r"><span style="color:var(--ink2);">Yıllık iade</span><span class="tx-v">~'+fmtN(yiade)+' ₺</span></div>'+
    '<div class="tx-r"><span style="color:var(--ink2);">Toplam prim birikimi</span><span class="tx-v">~'+fmtN(getSigortaToplamBirikim())+' ₺</span></div>';
  document.getElementById('v-yillik').textContent='~'+fmtN(yiade)+' ₺';
  document.getElementById('v-toplam').textContent='~'+fmtN(yiade+4500)+' ₺';
  document.getElementById('s-vergi').textContent='~'+fmtN(yiade+4500)+' ₺';
}

function toggleSigortaForm(){var f=document.getElementById('sig-form-vergi');f.style.display=f.style.display==='none'?'block':'none';if(P.sigorta==='var'){document.getElementById('v-sig-pb').value=P.sigortaPB||'tl';document.getElementById('v-sig-prim').value=P.sigortaPrim||'';}}

function sigortaKaydet(){
  var pb=document.getElementById('v-sig-pb').value,prim=parseFloat(document.getElementById('v-sig-prim').value)||0;
  if(prim<=0){alert('Geçerli bir prim tutarı gir.');return;}
  P.sigorta='var';P.sigortaPrim=prim;P.sigortaPB=pb;
  if(!S.sigortaBaslangic)S.sigortaBaslangic=new Date().toISOString();
  var idx=TUM_PROFILLER.findIndex(function(p){return p.id===P.id;});
  if(idx>=0){TUM_PROFILLER[idx]=P;try{localStorage.setItem('mn-profiller',JSON.stringify(TUM_PROFILLER));}catch(e){}}
  saveState();document.getElementById('sig-form-vergi').style.display='none';updateAll();updateSigortaDetay();renderHedef();buildAksiyon();
}

// ── KURLAR ────────────────────────────────────────────────────────────────
var _lastRateFetchOk=false;
async function fetchRates(){
  var updEl=document.getElementById('upd-time');
  if(updEl){updEl.textContent='Güncelleniyor...';updEl.classList.add('tk-loading');}
  try{
    var u='https://banker-furkan.vercel.app/api/rates';
    var r=await fetch(u),d=await r.json();
    S.prev=Object.assign({},S.rates);S.rates.usd=d.usd||42.8;S.rates.eur=d.eur||50.2;S.rates.altin=d.altin||7100;S.rates.ons=d.ons||3000;
    var n=new Date();
    if(updEl){updEl.textContent='Canlı · '+n.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});updEl.classList.remove('tk-loading');}
    if(!_lastRateFetchOk){showToast('Kurlar güncellendi','success',2000);}
    _lastRateFetchOk=true;
  }catch(e){
    if(!S.rates.altin)S.rates={altin:7100,usd:42.8,eur:50.2,ons:3000};
    if(updEl){updEl.textContent='Çevrimdışı';updEl.classList.remove('tk-loading');}
    if(_lastRateFetchOk!==false)showToast('Kurlar güncellenemedi — çevrimdışı veriler kullanılıyor','warning',4000);
    _lastRateFetchOk=false;
  }
  updateAll();if(typeof alarmlariKontrolEt==='function')alarmlariKontrolEt();
}

function updateChg(id,c,p){var el=document.getElementById(id);if(!el)return;if(!p||!c){el.textContent='—';el.className='tk-chg chg-n';return;}var pct=((c-p)/p*100).toFixed(2);el.textContent=(c>p?'+':'')+pct+'%';el.className='tk-chg '+(c>p?'chg-u':c<p?'chg-d':'chg-n');}
function vergiBelirle(b){if(!b)return 0.27;if(b>150000)return 0.40;if(b>60000)return 0.35;if(b>22000)return 0.27;if(b>8000)return 0.20;return 0.15;}
function vergiBelirleGercek(brut,vergi){if(vergi&&vergi>0&&brut>0){var ef=vergi/brut;if(ef>=0.36)return 0.40;if(ef>=0.30)return 0.35;if(ef>=0.22)return 0.27;if(ef>=0.16)return 0.20;return 0.15;}return vergiBelirle(brut);}

function updateAll(){
  var altin=S.rates.altin,usd=S.rates.usd,eur=S.rates.eur,ons=S.rates.ons;
  if(!altin)return;
  document.getElementById('t-altin').textContent=fmtR(altin)+' ₺';
  document.getElementById('t-usd').textContent=usd.toFixed(2)+' ₺';
  document.getElementById('t-eur').textContent=eur.toFixed(2)+' ₺';
  document.getElementById('t-ons').textContent=Math.round(ons).toLocaleString('tr-TR')+' $';
  updateChg('t-ac',altin,S.prev.altin);updateChg('t-uc',usd,S.prev.usd);updateChg('t-ec',eur,S.prev.eur);updateChg('t-oc',ons,S.prev.ons);
  var aA=S.araclar.find(function(a){return a.id==='altin';});var aO=aA?aA.oran/100:0.45;var aTutar=S.yatirim*aO;
  document.getElementById('t-gram-lbl').textContent=fmtR(aTutar)+'₺=';
  document.getElementById('t-gram').textContent=(aTutar/altin).toFixed(2)+' gram';
  renderDagılım();
  document.getElementById('yatirim-baslik').textContent=fmtN(S.yatirim)+' ₺';
  document.getElementById('s-yatirim').textContent=fmtN(S.yatirim)+' ₺';
  var pct=P.gelir>0?Math.round(S.yatirim/P.gelir*100):0;
  document.getElementById('s-oran').textContent="Gelinin %"+pct+"'i yatırıma";
  document.getElementById('d-tasarruf-pill').textContent='%'+pct+' tasarruf';
  document.getElementById('s-maas').textContent=fmtN(S.maas)+' ₺';
  // Anlık hesaplamalar
  var uA=S.araclar.find(function(a){return a.id==='usd';});var uO=uA?uA.oran/100:0.10;
  document.getElementById('c-gram').textContent=GIZLI?'••••••':(S.yatirim*aO/altin).toFixed(2)+' gram';
  document.getElementById('c-usd').textContent=GIZLI?'••••••':Math.round(S.yatirim*uO/usd).toLocaleString('tr-TR')+' $';
  document.getElementById('c-sig-toplam').textContent=P&&P.sigorta==='var'?fmtN(getSigortaToplamBirikim())+' ₺':'Sigorta yok';
  document.getElementById('c-sig-bu-ay').textContent=P&&P.sigorta==='var'?fmtN(getSigortaPrimTL())+' ₺':'—';
  document.getElementById('c-sure').textContent=P&&P.emekYas?(P.emekYas-P.yas)+' yıl · '+P.emekYas+' yaş':'—';
  var oran=vergiBelirleGercek(S.brut,S.vergiBrut),aiade=getSigortaAylikIade(),yiade=aiade*12;
  document.getElementById('s-vergi').textContent='~'+fmtN(yiade+4500)+' ₺';
  document.getElementById('v-yillik').textContent='~'+fmtN(yiade)+' ₺';
  document.getElementById('v-toplam').textContent='~'+fmtN(yiade+4500)+' ₺';
  var dPct=Math.round(oran*100);
  document.getElementById('v-dilim-big').textContent='%'+dPct;
  document.getElementById('v-dilim-big').style.color=dPct>=35?'var(--red)':dPct>=27?'var(--gold)':'var(--green)';
  document.getElementById('v-dilim-acikla').textContent='Tahmini vergi dilimi: %'+dPct;
  // Kalan süre pill güncelle
  var kalan=(P.emekYas||55)-(P.yas||27);
  var yasP=document.getElementById('d-yas-pill');if(yasP)yasP.textContent=(P.yas||27)+' yaş · '+(P.emekYas||55)+"'a "+kalan+' yıl';
  // Risk profili
  var rA={konser:'Muhafazakâr',dengeli:'Dengeli',agresif:'Agresif',katilim:'Katılım'};
  document.getElementById('s-risk').textContent=rA[P.risk]||P.risk;
  document.getElementById('s-risk-sub').textContent=kalan+' yıl planlama';
  buildSenaryolar();
  // Aktif sekmeleri güncelle
  var hTab=document.getElementById('tab-hedef');if(hTab&&hTab.classList.contains('active'))renderHedef();
  var yTab=document.getElementById('tab-yolharitasi');if(yTab&&yTab.classList.contains('active'))buildTimeline();
  var aTab=document.getElementById('tab-aksiyon');if(aTab&&aTab.classList.contains('active'))buildAksiyon();
  var gTab=document.getElementById('tab-gider');if(gTab&&gTab.classList.contains('active')){renderGiderler();renderGiderCharts();}
  var bkTab=document.getElementById('tab-bakiye');if(bkTab&&bkTab.classList.contains('active'))renderBakiye();
  var alTab=document.getElementById('tab-alarmlar');if(alTab&&alTab.classList.contains('active'))renderAlarmListe();
  updateSigortaDetay();
  var alEl=document.getElementById('al-arac');if(alEl){var f={altin:altin,usd:usd,eur:eur,ons:ons}[alEl.value];var sEl=document.getElementById('al-simdi');if(sEl&&f)sEl.textContent='Şu an: '+f.toLocaleString('tr-TR');}
}

// ── TAB ───────────────────────────────────────────────────────────────────
function goTab(name,btn,skipHash) {
  if(!skipHash && TAB_ORDER.indexOf(name) !== -1) history.pushState(null, null, '#'+name);
  var newIdx=TAB_ORDER.indexOf(name);
  var dir=newIdx>currentTabIdx?'slide-right':'slide-left';
  if(newIdx>=0)currentTabIdx=newIdx;
  document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('active','slide-left','slide-right');});
  document.querySelectorAll('.nb').forEach(function(b){b.classList.remove('active');});
  var tabEl=document.getElementById('tab-'+name);
  if(tabEl){tabEl.classList.add('active',dir);setTimeout(function(){tabEl.classList.remove('slide-left','slide-right');},400);}
  if(btn)btn.classList.add('active');
  haptic();
  if(name==='calculator')setTimeout(cu,50);
  if(name==='bakiye')setTimeout(renderBakiye,50);
  if(name==='hedef')setTimeout(renderHedef,50);
  if(name==='yolharitasi')buildTimeline();
  if(name==='aksiyon')buildAksiyon();
  if(name==='alarmlar'){renderAlarmListe();renderAlarmGecmis();bildirimBannerKontrol();}
  if(name==='vergi')updateSigortaDetay();
  if(name==='gider')setTimeout(function(){renderGiderler();renderGiderCharts();},50);
}

// ── YATIRIM & RISK DÜZENLE ──────────────────────────────────────────────────
function toggleYatirimEdit(){var d=document.getElementById('yatirim-display'),e=document.getElementById('yatirim-edit'),i=document.getElementById('yatirim-input');if(e.style.display==='none'){e.style.display='block';d.style.display='none';i.value=S.yatirim;i.focus();i.select();}else cancelYatirim();}
function cancelYatirim(){document.getElementById('yatirim-edit').style.display='none';document.getElementById('yatirim-display').style.display='block';}
function saveYatirim(){
  var v=parseInt(document.getElementById('yatirim-input').value);
  if(!v||v<100){showToast('Geçerli bir tutar gir (min 100 ₺)','warning');return;}
  S.yatirim=v;P.yatirim=v;
  var idx=TUM_PROFILLER.findIndex(function(x){return x.id===P.id;});
  if(idx>=0){TUM_PROFILLER[idx]=P;try{localStorage.setItem('mn-profiller',JSON.stringify(TUM_PROFILLER));}catch(e){}}
  saveState();updateAll();buildYasStrateji();buildSenaryolar();buildTimeline();renderHedef();buildAksiyon();cancelYatirim();cu();
  calculateHealthScore();
  showToast('Aylık yatırım güncellendi: '+fmtR(v)+' ₺','success');
}

function toggleRiskEdit(){var d=document.getElementById('risk-display'),e=document.getElementById('risk-edit'),i=document.getElementById('risk-input');if(e.style.display==='none'){e.style.display='block';d.style.display='none';i.value=P.risk||'dengeli';i.focus();}else cancelRisk();}
function cancelRisk(){document.getElementById('risk-edit').style.display='none';document.getElementById('risk-display').style.display='block';}
function saveRisk(){
  var r=document.getElementById('risk-input').value;
  P.risk=r;
  S.araclar=getDefaultAraclar(r);
  var idx=TUM_PROFILLER.findIndex(function(x){return x.id===P.id;});
  if(idx>=0){TUM_PROFILLER[idx]=P;try{localStorage.setItem('mn-profiller',JSON.stringify(TUM_PROFILLER));}catch(e){}}
  saveState();updateAll();buildYasStrateji();buildSenaryolar();buildTimeline();renderHedef();buildAksiyon();cancelRisk();cu();
  var rA={konser:'Muhafazakâr',dengeli:'Dengeli',agresif:'Agresif',katilim:'Katılım'};
  showToast('Risk profili: '+(rA[r]||r),'success');
}

// ── BORDRO ────────────────────────────────────────────────────────────────
function calcPreview(){var net=parseInt(document.getElementById('f-net').value)||0,brut=parseInt(document.getElementById('f-brut').value)||0;if(!net&&!brut){document.getElementById('preview-box').style.display='none';return;}document.getElementById('preview-box').style.display='block';var oran=vergiBelirleGercek(brut,parseInt(document.getElementById('f-vergi').value)||0),primTL=getSigortaPrimTL(),iade=primTL>0?primTL*0.5*oran:0;document.getElementById('prev-net').textContent=fmtR(net)+' ₺';document.getElementById('prev-dilim').textContent='%'+Math.round(oran*100);document.getElementById('prev-iade').textContent=primTL>0?'~'+fmtR(iade)+' ₺':'Sigorta yok';document.getElementById('prev-yiade').textContent=primTL>0?'~'+fmtR(iade*12)+' ₺':'—';}
function saveBordro(){var ay=document.getElementById('f-ay').value,net=parseInt(document.getElementById('f-net').value),brut=parseInt(document.getElementById('f-brut').value),vergi=parseInt(document.getElementById('f-vergi').value);if(!net||!brut){showToast('Net Maaş ve Brüt Ücret gerekli','warning');return;}S.maas=net;S.brut=brut;S.vergiBrut=vergi||0;P.gelir=net;var idx=TUM_PROFILLER.findIndex(function(x){return x.id===P.id;});if(idx>=0){TUM_PROFILLER[idx]=P;try{localStorage.setItem('mn-profiller',JSON.stringify(TUM_PROFILLER));}catch(e){}}document.getElementById('s-maas').textContent=fmtN(net)+' ₺';document.getElementById('s-maas-sub').textContent=ay+' bordrousu';var e={ay:ay,net:net,brut:brut,vergi:vergi,tarih:new Date().toLocaleDateString('tr-TR')};S.bordrolar=S.bordrolar.filter(function(b){return b.ay!==ay;});S.bordrolar.unshift(e);if(S.bordrolar.length>24)S.bordrolar.pop();saveState();renderHistory();updateAll();renderHedef();buildSenaryolar();buildTimeline();buildAksiyon();document.getElementById('success-box').style.display='block';document.getElementById('success-msg').textContent=ay+' bordrousu kaydedildi.';document.getElementById('f-net').value='';document.getElementById('f-brut').value='';document.getElementById('f-vergi').value='';document.getElementById('preview-box').style.display='none';showToast(ay+' bordrosu kaydedildi ✓','success');}
function renderHistory(){var c=document.getElementById('bordro-history');if(!S.bordrolar.length){c.innerHTML=emptyState('<i data-lucide="clipboard-list" style="width:40px;height:40px;margin:0 auto;display:block;"></i>','İlk bordronu gir','Maaş bordrosundaki 3 rakamı gir — vergi dilimin ve sigorta iadesi otomatik hesaplansın.','Bordro Gir',"scrollToEl('f-net')");document.getElementById('avg-maas').textContent='—';if(typeof lucide!=='undefined')lucide.createIcons();return;}c.innerHTML=S.bordrolar.map(function(b,i){return'<div class="history-item"><span class="h-badge">'+b.ay+'</span><span class="h-net">'+fmtN(b.net)+' ₺</span><span style="font-size:10px;color:var(--ink3);">'+b.tarih+'</span><span class="h-del" onclick="delBordro('+i+')">Sil</span></div>';}).join('');var avg=S.bordrolar.reduce(function(a,b){return a+b.net;},0)/S.bordrolar.length;document.getElementById('avg-maas').textContent=fmtN(avg)+' ₺';document.getElementById('avg-sub').textContent='Son '+S.bordrolar.length+' bordro ortalaması';if(typeof lucide!=='undefined')lucide.createIcons();}
function delBordro(i){if(!confirm(S.bordrolar[i].ay+' silinsin mi?'))return;S.bordrolar.splice(i,1);if(S.bordrolar.length>0){S.maas=S.bordrolar[0].net;S.brut=S.bordrolar[0].brut;S.vergiBrut=S.bordrolar[0].vergi||0;P.gelir=S.bordrolar[0].net;}saveState();renderHistory();updateAll();renderHedef();}

// ── HESAP MAKİNESİ ────────────────────────────────────────────────────────
var cc;
function calcPortfoy(aylik,getiriPct,yil,artisPct){var mr=getiriPct/100/12,p=aylik,m=aylik;for(var mo=1;mo<=yil*12;mo++){if(artisPct>0&&mo>1&&mo%6===1)m=Math.round(m*(1+artisPct/100));p=p*(1+mr)+m;}return Math.round(p);}
function cu(){var m=parseInt(document.getElementById('c-m').value),r=parseInt(document.getElementById('c-r').value),y=parseInt(document.getElementById('c-y').value),inc=parseInt(document.getElementById('c-inc').value);document.getElementById('c-m-o').textContent=(m>=1000?(m/1000).toFixed(0)+'K':m)+' ₺';document.getElementById('c-r-o').textContent='%'+r;document.getElementById('c-y-o').textContent=y+' yıl';document.getElementById('c-inc-o').textContent='%'+inc;var mr=r/100/12,p=m,inv=m,pA=[m],iA=[m],mA=m;for(var mo=1;mo<=y*12;mo++){if(inc>0&&mo>1&&mo%6===1)mA=Math.round(mA*(1+inc/100));p=p*(1+mr)+mA;inv+=mA;pA.push(Math.round(p));iA.push(Math.round(inv));}document.getElementById('c-res').textContent=fmt(p);document.getElementById('c-inv').textContent=fmt(inv);document.getElementById('c-gain').textContent='+'+fmt(p-inv);document.getElementById('c-income').textContent=fmt(Math.round(p*r/100/12))+' / ay';var sA=P.yas||27,ms='',sh={};[5,10,15,20,y].forEach(function(a){if(sh[a]||a>y)return;sh[a]=true;var age=sA+a,f=(a===y);ms+='<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border);'+(f?'font-weight:700;':'')+'"><span style="color:'+(f?'var(--green)':'var(--ink3)')+';">'+age+' yaş ('+a+'. yıl)</span><span style="color:'+(f?'var(--green)':'var(--ink)')+';">'+fmt(pA[Math.min(a*12,pA.length-1)])+'</span></div>';});document.getElementById('ms').innerHTML=ms;var labels=Array.from({length:y*12+1},function(_,i){return i%12===0?(sA+i/12)+' yaş':'';});if(cc)cc.destroy();cc=new Chart(document.getElementById('cc'),{type:'line',data:{labels:labels,datasets:[{label:'Portföy',data:pA,borderColor:'#B8860B',backgroundColor:'rgba(184,134,11,0.05)',fill:true,tension:0.4,pointRadius:0,borderWidth:2},{label:'Yatırılan',data:iA,borderColor:'#C8C8D0',borderDash:[4,4],fill:false,tension:0,pointRadius:0,borderWidth:1.5}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{boxWidth:8,font:{size:11},color:'#8E8E93',padding:10}}},scales:{y:{ticks:{callback:function(v){return fs(v);},font:{size:10},color:'#8E8E93'},grid:{color:'rgba(0,0,0,0.04)'}},x:{ticks:{font:{size:10},color:'#8E8E93',maxRotation:0},grid:{display:false}}}}});}

// ── BAKİYEM ───────────────────────────────────────────────────────────────
document.addEventListener('input',function(e){if(e.target.id==='bk-miktar'||e.target.id==='bk-alis'){var m=parseFloat(document.getElementById('bk-miktar').value)||0,a=parseFloat(document.getElementById('bk-alis').value)||0;document.getElementById('bk-maliyet').value=m&&a?Math.round(m*a).toLocaleString('tr-TR'):'';}});
function bakiyeEkle(){var arac=document.getElementById('bk-arac').value,miktar=parseFloat(document.getElementById('bk-miktar').value),alis=parseFloat(document.getElementById('bk-alis').value);if(!miktar||!alis){showToast('Miktar ve alış fiyatı giriniz','warning');return;}var I={altin:{ad:' Gram Altın',renk:'#C9A84C',birim:'gram'},ppf:{ad:' Para Piy. Fonu',renk:'#1A7A4A',birim:'₺'},bist:{ad:' BİST 30',renk:'#1A5FAA',birim:'pay'},usd:{ad:' Döviz Fonu',renk:'#7B3FBE',birim:'$'},diger:{ad:' Diğer',renk:'#888',birim:'adet'}},info=I[arac]||I['diger'];S.bakiye.push({id:Date.now(),arac:arac,ad:info.ad,renk:info.renk,birim:info.birim,miktar:miktar,alis:alis,maliyet:Math.round(miktar*alis),tarih:new Date().toLocaleDateString('tr-TR')});saveState();document.getElementById('bk-miktar').value='';document.getElementById('bk-alis').value='';document.getElementById('bk-maliyet').value='';renderBakiye();renderHedef();showToast(info.ad+' pozisyon eklendi','success');}
function bakiyeSil(id){if(!confirm('Bu pozisyonu sil?'))return;S.bakiye=S.bakiye.filter(function(b){return b.id!==id;});saveState();renderBakiye();renderHedef();}
function renderBakiye(){var liste=document.getElementById('bakiye-liste'),ozet=document.getElementById('bk-ozet');if(!liste||!ozet)return;if(!S.bakiye.length){liste.innerHTML=emptyState('<i data-lucide="briefcase" style="width:40px;height:40px;margin:0 auto;display:block;"></i>','İlk pozisyonunu ekle','Altın, döviz, fon gibi yatırımlarını ekle ve portföyünü canlı takip et.','+ Pozisyon Ekle',"scrollToEl('bk-miktar')");document.getElementById('bk-toplam-deger').textContent='—';document.getElementById('bk-toplam-maliyet').textContent='—';document.getElementById('bk-karzarar').textContent='—';document.getElementById('bk-karzarar-pct').textContent='—';ozet.innerHTML='';if(typeof lucide!=='undefined')lucide.createIcons();return;}var tM=0,tD=0,aO={};var rows=S.bakiye.map(function(b){var fn=ARAC_FN[b.arac]||ARAC_FN['diger'],gf=fn(),gd=(b.arac==='ppf'||b.arac==='diger')?b.maliyet:Math.round(b.miktar*gf),kz=gd-b.maliyet,kzP=b.maliyet>0?((kz/b.maliyet)*100).toFixed(1):0;tM+=b.maliyet;tD+=gd;if(!aO[b.arac])aO[b.arac]={ad:b.ad,renk:b.renk,maliyet:0,deger:0};aO[b.arac].maliyet+=b.maliyet;aO[b.arac].deger+=gd;var kzC=kz>0?'var(--green)':kz<0?'var(--red)':'var(--ink3)';return'<div style="background:var(--cream);border-radius:8px;padding:10px 12px;margin-bottom:8px;border:1px solid var(--border);"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;"><div style="display:flex;align-items:center;gap:8px;"><div style="width:8px;height:8px;border-radius:50%;background:'+b.renk+';"></div><span style="font-size:13px;font-weight:600;">'+b.ad+'</span><span style="font-size:10px;color:var(--ink3);">'+b.tarih+'</span></div><button onclick="bakiyeSil('+b.id+')" style="font-size:16px;background:none;border:none;cursor:pointer;color:var(--ink3);">×</button></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;font-size:11px;"><div><div style="color:var(--ink3);">Miktar</div><div style="font-weight:600;">'+b.miktar+' '+b.birim+'</div></div><div><div style="color:var(--ink3);">Maliyet</div><div style="font-weight:600;">'+fmtN(b.maliyet)+' ₺</div></div><div><div style="color:var(--ink3);">Güncel</div><div style="font-weight:600;">'+fmtN(gd)+' ₺</div></div></div><div style="margin-top:6px;font-size:12px;font-weight:700;color:'+kzC+';">'+(kz>0?'+':'')+fmtN(kz)+' ₺ ('+(kz>0?'+':'')+kzP+'%)</div></div>';}).join('');liste.innerHTML=rows;var tKZ=tD-tM,tP=tM>0?((tKZ/tM)*100).toFixed(1):0,kzC=tKZ>0?'var(--green)':tKZ<0?'var(--red)':'var(--ink3)';document.getElementById('bk-toplam-deger').textContent=fmtN(tD)+' ₺';document.getElementById('bk-toplam-maliyet').textContent='Maliyet: '+fmtN(tM)+' ₺';document.getElementById('bk-karzarar').textContent=(tKZ>0?'+':'')+fmtN(tKZ)+' ₺';document.getElementById('bk-karzarar').style.color=kzC;document.getElementById('bk-karzarar-pct').textContent=(tKZ>0?'+':'')+tP+'%';ozet.innerHTML=Object.values(aO).map(function(a){var kz=a.deger-a.maliyet,kzP=a.maliyet>0?((kz/a.maliyet)*100).toFixed(1):0,kzC=kz>0?'var(--green)':kz<0?'var(--red)':'var(--ink3)';return'<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--border);"><div style="display:flex;align-items:center;gap:7px;"><div style="width:8px;height:8px;border-radius:50%;background:'+a.renk+';"></div><span style="font-size:12px;font-weight:500;">'+a.ad+'</span></div><div style="text-align:right;"><div style="font-size:13px;font-weight:700;">'+fmtN(a.deger)+' ₺</div><div style="font-size:10px;font-weight:600;color:'+kzC+';">'+(kz>0?'+':'')+kzP+'%</div></div></div>';}).join('');if(typeof lucide!=='undefined')lucide.createIcons();}

// ── HEDEF ─────────────────────────────────────────────────────────────────
function renderHedef(){if(!P.yas)return;var yas=P.yas,hYas=P.emekYas||55,getiri=18,artis=P.artis||0,tYil=hYas-yas,aylik=S.yatirim,hP=calcPortfoy(aylik,getiri,tYil,artis),gercek=S.bakiye.reduce(function(t,b){var fn=ARAC_FN[b.arac]||ARAC_FN['diger'];return t+(b.arac==='ppf'||b.arac==='diger'?b.maliyet:Math.round(b.miktar*fn()));},0),gAy=S.bordrolar.length,gYil=gAy/12,zPct=Math.min((gYil/tYil)*100,100).toFixed(1),beklenen=gYil>0?calcPortfoy(aylik,getiri,gYil,artis):0,bPct=hP>0?Math.min((gercek/hP)*100,100).toFixed(2):0,fark=gercek-beklenen;document.getElementById('hd-hedef').textContent=fmt(hP);document.getElementById('hd-hedef-sub').textContent=hYas+' yaşında · %'+getiri;document.getElementById('hd-gercek').textContent=gercek>0?fmt(gercek):'Bakiye gir';document.getElementById('hd-pct').textContent=gercek>0?'%'+bPct:'—';document.getElementById('hd-pct').style.color=gercek>0?'var(--green)':'var(--ink3)';document.getElementById('hd-pct-sub').textContent=gercek>0?'Hedefe ulaşma':'Bakiyem sekmesine gir';document.getElementById('hd-kalan').textContent=(tYil-gYil).toFixed(1)+' yıl';document.getElementById('hd-kalan-sub').textContent=hYas+' yaşına kalan';document.getElementById('hd-baslangic-lbl').textContent=yas+' yaş';document.getElementById('hd-hedef-yas-lbl').textContent=hYas+' yaş';document.getElementById('hd-zaman-bar').style.width=zPct+'%';document.getElementById('hd-gecen').textContent='← '+gYil.toFixed(1)+' yıl ('+zPct+'%)';document.getElementById('hd-birikim-bar').style.width=bPct+'%';document.getElementById('hd-birikim-pct-lbl').textContent='%'+bPct;document.getElementById('hd-beklenen').textContent=beklenen>0?fmt(beklenen):'—';document.getElementById('hd-gercek2').textContent=gercek>0?fmt(gercek):'—';document.getElementById('hd-fark').textContent=beklenen>0?(fark>=0?'+':'')+fmt(Math.abs(fark)):'—';document.getElementById('hd-fark').style.color=fark>=0?'var(--green)':'var(--red)';var yEl=document.getElementById('hd-yorum');if(gercek===0){yEl.style.background='var(--blue-bg)';yEl.style.color='var(--blue)';yEl.textContent='Bakiyem sekmesine gerçek birikimini gir.';}else if(fark>=0){yEl.style.background='var(--green-bg)';yEl.style.color='var(--green)';yEl.textContent='Harika! Beklenenin önündesin.';}else{yEl.style.background='var(--gold-bg)';yEl.style.color='var(--gold)';yEl.textContent='Biraz geride. Aylık yatırımını artırarak telafi edebilirsin.';}var rEl=document.getElementById('hd-rozet');if(gercek===0){rEl.textContent='Başlangıç';rEl.style.background='#F2F2F7';rEl.style.color='var(--ink3)';}else if(fark>=0){rEl.textContent='Hedefte';rEl.style.background='var(--green-bg)';rEl.style.color='var(--green)';}else{rEl.textContent='Yakala';rEl.style.background='var(--gold-bg)';rEl.style.color='var(--gold)';}var taslar='';[5,10,15,20,tYil].forEach(function(a){if(a>tYil)return;var age=yas+a,b=calcPortfoy(aylik,getiri,a,artis),f=(a===tYil),g=gYil>=a;taslar+='<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--border);"><div style="display:flex;align-items:center;gap:8px;"><div style="width:8px;height:8px;border-radius:50%;background:'+(g?'var(--green)':f?'var(--gold)':'#DDD')+';"></div><span style="font-size:12px;'+(f?'font-weight:700;':'')+'color:'+(f?'var(--gold)':g?'var(--green)':'var(--ink3)')+';">' +age+' yaş ('+a+'. yıl)</span></div><span style="font-size:13px;font-weight:700;color:'+(f?'var(--gold)':g?'var(--green)':'var(--ink)')+';">' +fmt(b)+'</span></div>';});document.getElementById('hd-taslar').innerHTML=taslar;}

// ── ALARMLAR ──────────────────────────────────────────────────────────────
function bildirimIzniIste(){if(!('Notification' in window)){alert('Bu tarayıcı bildirimleri desteklemiyor.');return;}Notification.requestPermission().then(function(p){if(p==='granted'){document.getElementById('bildirim-banner').style.display='none';bildirimGonder('Mangır','Bildirimler aktif!');}});};
function bildirimBannerKontrol(){var b=document.getElementById('bildirim-banner');if(!b)return;if(!('Notification' in window)||Notification.permission==='granted')b.style.display='none';}
function bildirimGonder(baslik,mesaj){if(Notification.permission==='granted')new Notification(baslik,{body:mesaj});S.alarmGecmis.unshift({zaman:new Date().toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'}),tarih:new Date().toLocaleDateString('tr-TR'),baslik:baslik,mesaj:mesaj});if(S.alarmGecmis.length>20)S.alarmGecmis.pop();saveState();renderAlarmGecmis();}
function updateAlarmHint(){var f={altin:S.rates.altin,usd:S.rates.usd,eur:S.rates.eur,ons:S.rates.ons}[document.getElementById('al-arac').value];var el=document.getElementById('al-simdi');if(el&&f)el.textContent='Şu an: '+f.toLocaleString('tr-TR');}
function alarmEkle(){var arac=document.getElementById('al-arac').value,yon=document.getElementById('al-yon').value,fiyat=parseFloat(document.getElementById('al-fiyat').value);if(!fiyat||fiyat<=0){showToast('Geçerli bir fiyat girin','warning');return;}var I={altin:'Gram Altın',usd:'USD/TL',eur:'EUR/TL',ons:'ONS/$'};S.alarmlar.push({id:Date.now(),arac:arac,ad:I[arac],yon:yon,fiyat:fiyat,aktif:true,tetiklendi:false});saveState();document.getElementById('al-fiyat').value='';renderAlarmListe();showToast('Alarm kuruldu: '+I[arac]+' '+(yon==='yukari'?'↑':'↓')+' '+fiyat,'success');}
function alarmSil(id){S.alarmlar=S.alarmlar.filter(function(a){return a.id!==id;});saveState();renderAlarmListe();}
function alarmToggle(id){S.alarmlar=S.alarmlar.map(function(a){if(a.id===id){a.aktif=!a.aktif;a.tetiklendi=false;}return a;});saveState();renderAlarmListe();}
function renderAlarmListe(){var el=document.getElementById('alarm-liste');if(!el)return;if(!S.alarmlar.length){el.innerHTML=emptyState('<i data-lucide="bell" style="width:40px;height:40px;margin:0 auto;display:block;"></i>','Fiyat alarmı kur','Altın, döviz veya ons fiyatı hedefine ulaşınca anında bildirim al.','+ Alarm Ekle',"scrollToEl('al-fiyat')");if(typeof lucide!=='undefined')lucide.createIcons();return;}var F={altin:S.rates.altin,usd:S.rates.usd,eur:S.rates.eur,ons:S.rates.ons};el.innerHTML=S.alarmlar.map(function(a){var gf=F[a.arac],yakin=gf&&Math.abs(gf-a.fiyat)/a.fiyat<0.02,bg=a.tetiklendi?'var(--green-bg)':yakin?'var(--gold-bg)':'var(--cream)',bd=a.tetiklendi?'var(--green-bd)':yakin?'var(--gold-bd)':'var(--border)';return'<div style="background:'+bg+';border:1px solid '+bd+';border-radius:8px;padding:10px 12px;margin-bottom:8px;"><div style="display:flex;justify-content:space-between;align-items:center;"><div><div style="font-size:13px;font-weight:600;">'+a.ad+' '+(a.yon==='yukari'?'↑':'↓')+' '+a.fiyat.toLocaleString('tr-TR')+(a.arac==='ons'?' $':' ₺')+'</div><div style="font-size:10px;color:var(--ink3);margin-top:2px;">'+(a.yon==='yukari'?'Yukarı geçince':'Aşağı düşünce')+(gf?' · Şu an: '+gf.toLocaleString('tr-TR'):'')+(a.tetiklendi?' · ✓ Tetiklendi':'')+(yakin&&!a.tetiklendi?' · ⚡ Yaklaşıyor!':'')+'</div></div><div style="display:flex;gap:8px;align-items:center;"><button onclick="alarmToggle('+a.id+')" style="font-size:10px;padding:3px 8px;border-radius:12px;border:1px solid var(--border);background:'+(a.aktif?'var(--green-bg)':'var(--cream)')+';color:'+(a.aktif?'var(--green)':'var(--ink3)')+';cursor:pointer;font-family:var(--sans);font-weight:600;">'+(a.aktif?'Aktif':'Pasif')+'</button><button onclick="alarmSil('+a.id+')" style="font-size:16px;background:none;border:none;cursor:pointer;color:var(--ink3);">×</button></div></div></div>';}).join('');if(typeof lucide!=='undefined')lucide.createIcons();}
function alarmlariKontrolEt(){if(!S.rates.altin)return;var F={altin:S.rates.altin,usd:S.rates.usd,eur:S.rates.eur,ons:S.rates.ons},degisti=false;S.alarmlar.forEach(function(a){if(!a.aktif||a.tetiklendi)return;var gf=F[a.arac];if(!gf)return;if((a.yon==='yukari'&&gf>=a.fiyat)||(a.yon==='asagi'&&gf<=a.fiyat)){a.tetiklendi=true;degisti=true;bildirimGonder('Fiyat Alarmı!',a.ad+' '+gf.toLocaleString('tr-TR')+(a.arac==='ons'?'$':'₺')+' seviyesine '+(a.yon==='yukari'?'yükseldi':'düştü')+'!');}});if(degisti){saveState();renderAlarmListe();}updateAlarmHint();}
function renderAlarmGecmis(){var el=document.getElementById('alarm-gecmis');if(!el)return;if(!S.alarmGecmis.length){el.innerHTML='<div style="font-size:12px;color:var(--ink3);text-align:center;padding:12px 0;">Henüz bildirim yok.</div>';return;}el.innerHTML=S.alarmGecmis.slice(0,10).map(function(g){return'<div style="padding:7px 0;border-bottom:1px solid var(--border);"><div style="display:flex;justify-content:space-between;"><span style="font-size:12px;font-weight:600;">'+g.baslik+'</span><span style="font-size:10px;color:var(--ink3);">'+g.zaman+'</span></div><div style="font-size:11px;color:var(--ink3);margin-top:1px;">'+g.mesaj+'</div></div>';}).join('');}
function gecmisiTemizle(){S.alarmGecmis=[];saveState();renderAlarmGecmis();}
function maasHatirlaticiKaydet(){var gun=parseInt(document.getElementById('maas-gun').value)||15,hatir=parseInt(document.getElementById('maas-hatir').value)||0;try{localStorage.setItem('mn-maas-'+(P.id||P.ad),JSON.stringify({gun:gun,hatirlatma:hatir}));}catch(e){}document.getElementById('maas-durum').textContent='✓ Kaydedildi! Her ayın '+gun+'. gününde.';document.getElementById('maas-durum').style.color='var(--green)';}

// ── BOTTOM NAV ───────────────────────────────────────────────────────────
function goTabBottom(name,btn,skipHash){
  if(!skipHash && TAB_ORDER.indexOf(name) !== -1) history.pushState(null, null, '#'+name);
  var newIdx=TAB_ORDER.indexOf(name);
  var dir=newIdx>currentTabIdx?'slide-right':'slide-left';
  if(newIdx>=0)currentTabIdx=newIdx;
  document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('active','slide-left','slide-right');});
  document.querySelectorAll('.nb').forEach(function(b){b.classList.remove('active');});
  document.querySelectorAll('.bnav-item').forEach(function(b){b.classList.remove('active');});
  var tabEl=document.getElementById('tab-'+name);
  if(tabEl){tabEl.classList.add('active',dir);setTimeout(function(){tabEl.classList.remove('slide-left','slide-right');},400);}
  if(btn)btn.classList.add('active');
  haptic();
  var nbs=document.querySelectorAll('.nb');
  nbs.forEach(function(b){if(b.textContent.toLowerCase().indexOf(name)>-1||b.onclick.toString().indexOf("'"+name+"'")>-1)b.classList.add('active');});
  if(name==='calculator')setTimeout(cu,50);
  if(name==='bakiye')setTimeout(renderBakiye,50);
  if(name==='hedef')setTimeout(renderHedef,50);
  if(name==='yolharitasi')buildTimeline();
  if(name==='aksiyon')buildAksiyon();
  if(name==='alarmlar'){renderAlarmListe();renderAlarmGecmis();bildirimBannerKontrol();}
  if(name==='vergi')updateSigortaDetay();
  if(name==='gider')setTimeout(function(){renderGiderler();renderGiderCharts();},50);
  window.scrollTo({top:0,behavior:'smooth'});
}
function toggleBottomMore(){
  var tabs=['yolharitasi','aksiyon','alarmlar','bordro','vergi'];
  var names=['Yol Haritası','✓ Aksiyon','Alarmlar','Bordro','Vergi'];
  var menu=document.createElement('div');
  menu.style.cssText='position:fixed;bottom:60px;right:12px;background:var(--white);border:1px solid var(--border);border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,.12);padding:8px 4px;z-index:300;animation:fadeInUp .2s ease-out;min-width:160px;';
  menu.id='bottom-more-menu';
  var old=document.getElementById('bottom-more-menu');if(old){old.remove();return;}
  tabs.forEach(function(t,i){
    var btn=document.createElement('button');
    btn.style.cssText='display:block;width:100%;text-align:left;padding:10px 14px;border:none;background:none;font-size:13px;font-weight:500;cursor:pointer;font-family:var(--sans);color:var(--ink);border-radius:8px;transition:background .15s;';
    btn.textContent=names[i];
    btn.onmouseover=function(){this.style.background='var(--gold-bg)';};
    btn.onmouseout=function(){this.style.background='none';};
    btn.onclick=function(){menu.remove();goTabBottom(t,null);document.querySelectorAll('.bnav-item').forEach(function(b){b.classList.remove('active');});};
    menu.appendChild(btn);
  });
  document.body.appendChild(menu);
  document.addEventListener('click',function closeMenu(e){if(!menu.contains(e.target)&&e.target.id!=='bnav-more'){menu.remove();document.removeEventListener('click',closeMenu);}},{once:false});
}

// ── GİDER TAKİBİ ─────────────────────────────────────────────────────────
var giderSecilenKat='';
var GIDER_KATS={market:{ad:'Market',icon:'<i data-lucide="shopping-cart" style="width:16px;height:16px;"></i>',renk:'#e67e22'},kira:{ad:'Kira',icon:'<i data-lucide="home" style="width:16px;height:16px;"></i>',renk:'#3498db'},fatura:{ad:'Faturalar',icon:'<i data-lucide="lightbulb" style="width:16px;height:16px;"></i>',renk:'#f1c40f'},ulasim:{ad:'Ulaşım',icon:'<i data-lucide="car" style="width:16px;height:16px;"></i>',renk:'#9b59b6'},yemek:{ad:'Yemek',icon:'<i data-lucide="coffee" style="width:16px;height:16px;"></i>',renk:'#e74c3c'},saglik:{ad:'Sağlık',icon:'<i data-lucide="activity" style="width:16px;height:16px;"></i>',renk:'#2ecc71'},giyim:{ad:'Giyim',icon:'<i data-lucide="shirt" style="width:16px;height:16px;"></i>',renk:'#1abc9c'},eglence:{ad:'Eğlence',icon:'<i data-lucide="ticket" style="width:16px;height:16px;"></i>',renk:'#e91e63'},diger:{ad:'Diğer',icon:'<i data-lucide="package" style="width:16px;height:16px;"></i>',renk:'#95a5a6'}};

function selectGiderCat(el,cat){
  document.querySelectorAll('.gider-cat').forEach(function(c){c.classList.remove('selected');});
  el.classList.add('selected');
  giderSecilenKat=cat;
}

function giderEkle(){
  if(!giderSecilenKat){showToast('Lütfen bir kategori seçin','warning');return;}
  var tutar=parseFloat(document.getElementById('gider-tutar').value);
  if(!tutar||tutar<=0){showToast('Geçerli bir tutar girin','warning');return;}
  var aciklama=document.getElementById('gider-aciklama').value.trim()||GIDER_KATS[giderSecilenKat].ad;
  if(!S.giderler)S.giderler=[];
  S.giderler.push({id:Date.now(),kategori:giderSecilenKat,aciklama:aciklama,tutar:tutar,tarih:new Date().toISOString(),ay:new Date().toLocaleDateString('tr-TR',{month:'long',year:'numeric'})});
  saveState();
  haptic();
  document.getElementById('gider-tutar').value='';
  document.getElementById('gider-aciklama').value='';
  document.querySelectorAll('.gider-cat').forEach(function(c){c.classList.remove('selected');});
  giderSecilenKat='';
  renderGiderler();renderGiderCharts();renderBudget();calculateHealthScore();
  showToast(esc(aciklama)+' gideri eklendi','success',2500);
}

function giderSil(id){
  if(!confirm('Bu gideri sil?'))return;
  S.giderler=S.giderler.filter(function(g){return g.id!==id;});
  saveState();
  var filtreEl=document.getElementById('gider-ay-filtre');
  if(filtreEl){
    var secilenAy=filtreEl.value;
    filtreEl.innerHTML='';
    var aylar={};
    S.giderler.forEach(function(g){aylar[g.ay]=true;});
    var now=new Date().toLocaleDateString('tr-TR',{month:'long',year:'numeric'});
    aylar[now]=true;
    Object.keys(aylar).forEach(function(a){var o=document.createElement('option');o.value=a;o.textContent=a;if(a===secilenAy)o.selected=true;filtreEl.appendChild(o);});
    if(!aylar[secilenAy])filtreEl.value=now;
  }
  renderGiderler();renderGiderCharts();renderBudget();calculateHealthScore();
}

function renderGiderler(){
  if(!S.giderler)S.giderler=[];
  // Ay filtresi başlat
  var filtreEl=document.getElementById('gider-ay-filtre');
  if(filtreEl&&filtreEl.options.length===0){
    var aylar={};S.giderler.forEach(function(g){aylar[g.ay]=true;});
    var now=new Date().toLocaleDateString('tr-TR',{month:'long',year:'numeric'});
    aylar[now]=true;
    Object.keys(aylar).forEach(function(a){var o=document.createElement('option');o.value=a;o.textContent=a;if(a===now)o.selected=true;filtreEl.appendChild(o);});
  }
  var secilenAy=filtreEl?filtreEl.value:new Date().toLocaleDateString('tr-TR',{month:'long',year:'numeric'});
  var filtered=S.giderler.filter(function(g){return g.ay===secilenAy;});
  var liste=document.getElementById('gider-liste');
  if(!filtered.length){liste.innerHTML=S.giderler.length===0?emptyState('<i data-lucide="receipt" style="width:40px;height:40px;margin:0 auto;display:block;"></i>','Harcamalarını takip et','Giderlerini kategorize et, aylık trendini gör ve bütçeni kontrol altında tut.','+ Gider Ekle',"scrollToEl('gider-tutar')"):'<div style="font-size:12px;color:var(--ink3);text-align:center;padding:16px 0;">Bu ay gider yok.</div>';document.getElementById('gider-toplam').textContent='0 ₺';document.getElementById('gider-kalan').textContent='—';if(typeof lucide!=='undefined')lucide.createIcons();return;}
  var toplam=filtered.reduce(function(s,g){return s+g.tutar;},0);
  document.getElementById('gider-toplam').textContent=fmtN(toplam)+' ₺';
  var kalan=S.maas-toplam-S.yatirim;
  document.getElementById('gider-kalan').textContent='Gelir: '+fmtN(S.maas)+' ₺ — Yatırım: '+fmtN(S.yatirim)+' ₺ — Kalan: '+fmtN(Math.max(0,kalan))+' ₺';
  liste.innerHTML=filtered.sort(function(a,b){return b.id-a.id;}).map(function(g){
    var info=GIDER_KATS[g.kategori]||GIDER_KATS['diger'];
    var tarih=new Date(g.tarih).toLocaleDateString('tr-TR',{day:'numeric',month:'short'});
    return '<div class="gider-item"><div style="width:32px;height:32px;border-radius:8px;background:'+info.renk+'15;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">'+info.icon+'</div><div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+esc(g.aciklama)+'</div><div style="font-size:10px;color:var(--ink3);margin-top:1px;">'+info.ad+' · '+tarih+'</div></div><div style="text-align:right;"><div style="font-size:14px;font-weight:700;color:var(--red);">-'+fmtN(g.tutar)+' ₺</div></div><button onclick="giderSil('+g.id+')" style="font-size:14px;background:none;border:none;cursor:pointer;color:var(--ink3);padding:0 4px;">×</button></div>';
  }).join('');
  if(typeof lucide!=='undefined')lucide.createIcons();
}

var giderPie,giderTrend;
function renderGiderCharts(){
  if(!S.giderler||!S.giderler.length){
    // Tüm giderler silindiğinde chartları temizle
    if(giderPie){giderPie.destroy();giderPie=null;}
    if(giderTrend){giderTrend.destroy();giderTrend=null;}
    var ozetEl=document.getElementById('gider-cats-ozet');if(ozetEl)ozetEl.innerHTML='';
    return;
  }
  var secilenAy=document.getElementById('gider-ay-filtre')?document.getElementById('gider-ay-filtre').value:new Date().toLocaleDateString('tr-TR',{month:'long',year:'numeric'});
  var filtered=S.giderler.filter(function(g){return g.ay===secilenAy;});
  // Pie chart
  var catTotals={};filtered.forEach(function(g){catTotals[g.kategori]=(catTotals[g.kategori]||0)+g.tutar;});
  var labels=[],data=[],colors=[];
  Object.keys(catTotals).forEach(function(k){var info=GIDER_KATS[k]||GIDER_KATS['diger'];labels.push(info.icon+' '+info.ad);data.push(catTotals[k]);colors.push(info.renk);});
  var pieEl=document.getElementById('gider-pie');
  if(pieEl){
    if(giderPie){giderPie.destroy();giderPie=null;}
    if(data.length>0){
      giderPie=new Chart(pieEl,{type:'doughnut',data:{labels:labels,datasets:[{data:data,backgroundColor:colors,borderWidth:2,borderColor:document.documentElement.getAttribute('data-theme')==='dark'?'#1a1a2e':'#fff'}]},options:{responsive:true,maintainAspectRatio:true,plugins:{legend:{display:false}}}});
    }
  }
  // Kategori özet
  var ozetEl=document.getElementById('gider-cats-ozet');
  if(ozetEl){
    if(data.length>0){
      var topTotal=data.reduce(function(a,b){return a+b;},0);
      ozetEl.innerHTML=labels.map(function(l,i){var pct=topTotal>0?((data[i]/topTotal)*100).toFixed(0):'0';return '<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid var(--border);font-size:12px;"><div style="display:flex;align-items:center;gap:6px;"><div style="width:8px;height:8px;border-radius:50%;background:'+colors[i]+';"></div><span>'+l+'</span></div><div style="font-weight:700;">'+fmtN(data[i])+' ₺ <span style="color:var(--ink3);font-weight:500;">(%'+pct+')</span></div></div>';}).join('');
    } else {
      ozetEl.innerHTML='';
    }
  }
  // Trend chart
  var ayTotals={};S.giderler.forEach(function(g){ayTotals[g.ay]=(ayTotals[g.ay]||0)+g.tutar;});
  var tLabels=Object.keys(ayTotals).slice(-6),tData=tLabels.map(function(a){return ayTotals[a];});
  var trendEl=document.getElementById('gider-trend');
  if(trendEl){
    if(giderTrend){giderTrend.destroy();giderTrend=null;}
    if(tLabels.length>0){
      giderTrend=new Chart(trendEl,{type:'bar',data:{labels:tLabels,datasets:[{label:'Gider',data:tData,backgroundColor:'rgba(231,76,60,.6)',borderRadius:6,borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{ticks:{callback:function(v){return fs(v);},font:{size:10},color:'#8E8E93'},grid:{color:'rgba(0,0,0,.04)'}},x:{ticks:{font:{size:10},color:'#8E8E93'},grid:{display:false}}}}});
    }
  }
}

// ── FAZ 3 (SAĞLIK SKORU, TEKRARLAYAN GIDER, BÜTÇE) ───────────────
function calculateHealthScore() {
  if(!P.id) return;
  var gel=P.gelir||0, yatS=S.yatirim||0;
  var gTotal=S.giderler?S.giderler.filter(function(g){return g.ay===new Date().toLocaleDateString('tr-TR',{month:'long',year:'numeric'})}).reduce(function(a,b){return a+b.tutar},0):0;
  var sRate=gel>0 ? Math.min(100, Math.round((yatS/gel)*100)) : 0;
  var gRate=gel>0 ? Math.min(100, Math.round((gTotal/gel)*100)) : 0;
  
  var score = 50; 
  if(sRate >= 20) score += 20; else if(sRate >= 10) score += 10;
  if(sRate >= 40) score += 10;
  if(gRate <= 50) score += 20; else if(gRate <= 70) score += 10; else if(gRate > 90) score -= 20;
  if(!S.bakiye || S.bakiye.length===0) score -= 10;

  score = Math.max(0, Math.min(100, score));

  var offset = 377 - (377 * score / 100);
  var ring = document.getElementById('health-ring-fg');
  if(ring) {
    ring.style.strokeDashoffset = offset;
    ring.style.stroke = score>=80 ? 'var(--green)' : score>=50 ? 'var(--gold)' : 'var(--red)';
  }
  var valEl = document.getElementById('health-score');
  if(valEl) valEl.textContent = score;

  var lblEl = document.getElementById('health-label');
  var grdEl = document.getElementById('health-grade');
  if(lblEl && grdEl) {
    if(score >= 80) { lblEl.textContent="Mükemmel"; grdEl.textContent="A Sınıfı Finansal Sağlık"; grdEl.style.color="var(--green)"; grdEl.style.background="var(--green-bg)"; }
    else if(score >= 50) { lblEl.textContent="İyi İlerliyorsun"; grdEl.textContent="B Sınıfı Finansal Sağlık"; grdEl.style.color="var(--gold)"; grdEl.style.background="var(--gold-bg)"; }
    else { lblEl.textContent="Biraz Düzenleme Şart"; grdEl.textContent="C Sınıfı Finansal Sağlık"; grdEl.style.color="var(--red)"; grdEl.style.background="var(--red-bg)"; }
  }

  var facEl = document.getElementById('health-factors');
  if(facEl) {
    facEl.innerHTML = 
      '<div class="health-factor"><span>Tasarruf Oranı (%'+sRate+')</span><div class="health-factor-bar"><div class="health-factor-fill" style="width:'+sRate+'%;background:'+(sRate>=20?'var(--green)':'var(--red)')+'"></div></div></div>' +
      '<div class="health-factor"><span>Gider/Gelir (%'+gRate+')</span><div class="health-factor-bar"><div class="health-factor-fill" style="width:'+Math.min(100,gRate)+'%;background:'+(gRate<=50?'var(--green)':gRate<=80?'var(--gold)':'var(--red)')+'"></div></div></div>';
  }
}

function applyRecurring() {
  if(!S.tekrarlayan || S.tekrarlayan.length===0) return;
  var currAy = new Date().toLocaleDateString('tr-TR',{month:'long',year:'numeric'});
  var hasAdded = false;
  S.tekrarlayan.forEach(function(r){
    if(r.sonAy !== currAy) {
      if(!S.giderler)S.giderler=[];
      S.giderler.push({id:Date.now()+Math.floor(Math.random()*1000), aciklama:r.ad+' (Oto)', tutar:r.tutar, kategori:r.kat, tarih:new Date().toISOString(), ay:currAy});
      r.sonAy = currAy;
      hasAdded = true;
    }
  });
  if(hasAdded) {
    saveState(); renderGiderler(); renderGiderCharts();
    showToast('Tekrarlayan giderler bu ay için işlendi','info',3000);
  }
}

function renderRecur() {
  var list = document.getElementById('recur-liste');
  if(!list) return;
  if(!S.tekrarlayan || S.tekrarlayan.length===0) {
    list.innerHTML='<div style="font-size:12px;color:var(--ink3);padding:10px 0;text-align:center;">Tekrarlayan gider yok.</div>';
    return;
  }
  list.innerHTML = S.tekrarlayan.map(function(r, i){
    var info=GIDER_KATS[r.kat]||GIDER_KATS['diger'];
    return '<div class="recur-item"><div class="recur-icon" style="background:'+info.renk+'20;">'+info.icon+'</div><div class="recur-info"><div class="recur-info-name">'+esc(r.ad)+'</div><div class="recur-info-sub">Ayın 1\'inde</div></div><div class="recur-amount">-'+fmtN(r.tutar)+' ₺</div><button class="recur-del" onclick="recurSil('+i+')">×</button></div>';
  }).join('');
}

function recurEkle() {
  var k=document.getElementById('recur-kat').value;
  var info=GIDER_KATS[k];
  var t=parseFloat(document.getElementById('recur-tutar').value);
  if(!t||t<=0){showToast('Geçerli bir tutar girin.','warning');return;}
  if(!S.tekrarlayan)S.tekrarlayan=[];
  S.tekrarlayan.push({ad:info.ad, kat:k, tutar:t, sonAy:''});
  saveState(); document.getElementById('recur-tutar').value='';
  renderRecur(); applyRecurring(); haptic();
  showToast('Sisteme eklendi ✓','success',2000);
}

function recurSil(i) {
  S.tekrarlayan.splice(i,1); saveState(); renderRecur(); haptic();
}

function toggleBudgetEdit() {
  var b=document.getElementById('budget-edit');
  if(b.style.display==='none'){ b.style.display='block'; renderBudgetInputs(); } else { b.style.display='none'; }
}

function renderBudgetInputs() {
  var limitDiv = document.getElementById('budget-limits');
  if(!limitDiv) return;
  var html = '';
  Object.keys(GIDER_KATS).forEach(function(k){
    var info=GIDER_KATS[k];
    var val = S.butce && S.butce[k] ? S.butce[k] : '';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><div style="font-size:12px;display:flex;align-items:center;gap:6px;">'+info.icon+' <span style="font-weight:600;">'+info.ad+'</span></div><input type="number" id="b-lim-'+k+'" class="form-input" placeholder="Limit ₺" value="'+val+'" style="width:100px;padding:6px 10px;font-size:12px;text-align:right;"></div>';
  });
  limitDiv.innerHTML = html;
}

function budgetKaydet() {
  if(!S.butce) S.butce = {};
  Object.keys(GIDER_KATS).forEach(function(k){
    var v=parseFloat(document.getElementById('b-lim-'+k).value);
    if(v>0) S.butce[k] = v; else delete S.butce[k];
  });
  saveState(); document.getElementById('budget-edit').style.display='none';
  renderBudget(); calculateHealthScore(); haptic();
  showToast('Bütçe limitleri kaydedildi ✓','success',2000);
}

function renderBudget() {
  var d=document.getElementById('budget-display');
  if(!d) return;
  if(!S.butce || Object.keys(S.butce).length===0) {
    d.innerHTML='<div style="font-size:12px;color:var(--ink3);text-align:center;padding:14px 0;background:var(--cream);border-radius:10px;">Bütçe belirleyerek harcamalarını kontrol altına al.</div>';
    return;
  }
  var currAy = new Date().toLocaleDateString('tr-TR',{month:'long',year:'numeric'});
  var currHarcamalar = {};
  if(S.giderler) S.giderler.filter(function(g){return g.ay===currAy}).forEach(function(g){ currHarcamalar[g.kategori] = (currHarcamalar[g.kategori]||0) + g.tutar; });
  
  var html='';
  Object.keys(S.butce).forEach(function(k){
    var limit = S.butce[k]; var info = GIDER_KATS[k];
    var harcama = currHarcamalar[k] || 0;
    var pct = Math.min(100, (harcama/limit)*100);
    var isOver = harcama>limit;
    html += '<div class="budget-item"><div class="budget-header"><div class="budget-cat"><div class="budget-cat-dot" style="background:'+info.renk+';"></div>'+info.ad+'</div><div class="budget-amounts"><strong style="color:'+(isOver?'var(--red)':'var(--ink)')+'">'+fmtN(harcama)+' ₺</strong> / '+fmtN(limit)+' ₺</div></div><div class="budget-bar '+(isOver?'over':'')+'"><div class="budget-fill" style="width:'+pct+'%;background:'+(isOver?'var(--red)':info.renk)+';"></div></div></div>';
  });
  d.innerHTML = html;
}

// ── INIT ──────────────────────────────────────────────────────────────────
initTheme();
setTimeout(function(){
  document.getElementById('splash').classList.add('fade');
  setTimeout(function(){ document.getElementById('splash').style.display='none'; }, 500);
  TUM_PROFILLER = JSON.parse((function(){ try{ return localStorage.getItem('mn-profiller')||'[]' }catch(e){ return '[]' } })());

  // Always go directly to auth screen - simple and clean
  showAuthScreen();

  // URL Routing Init
  window.addEventListener('hashchange', function(){
    var h = location.hash.replace('#','');
    if(TAB_ORDER.indexOf(h) !== -1) goTab(h, null, true);
  });
  if(location.hash) {
    var initialHash = location.hash.replace('#','');
    if(TAB_ORDER.indexOf(initialHash) !== -1) goTab(initialHash, null, true);
  }

  // Initialize scroll hints after dashboard is ready
  setTimeout(initScrollHints, 500);
}, 1800);

