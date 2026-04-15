const https = require('https');

const fetchJSON = (url) =>
  new Promise((resolve, reject) => {
    const request = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (resp) => {
      let raw = '';
      resp.on('data', (chunk) => (raw += chunk));
      resp.on('end', () => { try { resolve(JSON.parse(raw)); } catch (e) { reject(e); } });
    });
    request.on('error', reject);
    request.setTimeout(5000, () => { request.destroy(); reject(new Error('timeout')); });
  });

const cleanNum = (str) => {
  if (!str) return 0;
  let cleaned = str.toString().replace(/\./g, '').replace(',', '.');
  return parseFloat(cleaned);
};

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store, max-age=0'); // Önbelliği kapat, her seferinde yeni veri al

  try {
    // 1. ADRES: Truncgil Finance (E harfi ile daha stabildir)
    const data = await fetchJSON('https://finance.truncgil.com/v3/today.json');
    
    const usd = cleanNum(data.USD?.Selling);
    const eur = cleanNum(data.EUR?.Selling);
    const altin = cleanNum(data["Gram Altın"]?.Selling || data["GA"]?.Selling);

    // Eğer rakamlar 0 gelirse (hata olmuşsa) catch bloğuna fırlat
    if (!usd || !altin) throw new Error("Veri boş geldi");

    return res.status(200).json({
      usd, eur, altin,
      ons: parseFloat(((altin * 31.1035) / usd).toFixed(2)),
      kaynak: 'truncgil-canli',
      zaman: new Date().toISOString()
    });

  } catch (e) {
    // 2. ADRES (YEDEK): Eğer Truncgil çökerse GenelPara API'sini dene
    try {
      const backupData = await fetchJSON('https://api.genelpara.com/embed/para-birimleri.json');
      const usd = parseFloat(backupData.USD.satis);
      const eur = parseFloat(backupData.EUR.satis);
      const altin = parseFloat(backupData.GA.satis);

      return res.status(200).json({
        usd, eur, altin,
        ons: parseFloat(((altin * 31.1035) / usd).toFixed(2)),
        kaynak: 'genelpara-yedek',
        zaman: new Date().toISOString()
      });
    } catch (e2) {
      // HER ŞEY ÇÖKERSE EN SON ÇARE SABİT VERİLER
      return res.status(200).json({
        usd: 44.75, eur: 52.75, altin: 7100, ons: 4935,
        kaynak: 'tamamen-yedek-modu',
        hata: e2.message
      });
    }
  }
};
