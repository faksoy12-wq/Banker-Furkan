const https = require('https');

// İnternetten veri çeken araç
const fetchJSON = (url) =>
  new Promise((resolve, reject) => {
    const request = https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    }, (resp) => {
      let raw = '';
      resp.on('data', (chunk) => (raw += chunk));
      resp.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(new Error("Gelen veri bozuk (JSON değil)")); }
      });
    });
    request.on('error', reject);
    request.setTimeout(5000, () => { request.destroy(); reject(new Error('Zaman aşımı')); });
  });

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  try {
    // DAHA KARARLI OLAN V3 ADRESİNİ KULLANIYORUZ
    const data = await fetchJSON('https://finans.truncgil.com/v3/today.json');

    // V3 formatında veriler 'data.USD.Selling' şeklindedir
    const usdVal = parseFloat(data.USD?.Selling || 44.75);
    const eurVal = parseFloat(data.EUR?.Selling || 52.75);
    const altinVal = parseFloat(data["Gram Altın"]?.Selling || 7100);
    const onsVal = parseFloat(((altinVal * 31.1035) / usdVal).toFixed(2));

    return res.status(200).json({
      usd: usdVal,
      USD: usdVal,
      eur: eurVal,
      EUR: eurVal,
      altin: altinVal,
      ons: onsVal,
      kaynak: 'truncgil-v3-canli',
      zaman: new Date().toISOString(),
    });

  } catch (e) {
    // Eğer Truncgil yine hata verirse, Mangır projesi çökmesin diye bu değerler görünecek
    return res.status(200).json({
      usd: 44.75, 
      eur: 52.75, 
      altin: 7100, 
      ons: 4935,
      kaynak: 'yedek-modu',
      hata_nedeni: "Truncgil cevap vermiyor, yedek veriler yüklendi."
    });
  }
};
