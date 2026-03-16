module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

  try {
    const https = require('https');

    const fetchJSON = (url) => new Promise((resolve, reject) => {
      https.get(url, (resp) => {
        let raw = '';
        resp.on('data', chunk => raw += chunk);
        resp.on('end', () => { try { resolve(JSON.parse(raw)); } catch(e) { reject(e); } });
      }).on('error', reject);
    });

    // USD/TRY ve EUR/TRY - kayıt gerektirmeyen ücretsiz API
    const fx = await fetchJSON('https://open.er-api.com/v6/latest/USD');
    const tryRate = fx.rates && fx.rates.TRY ? fx.rates.TRY : 42.8;
    const eurTry  = fx.rates && fx.rates.EUR ? (fx.rates.TRY / fx.rates.EUR) : 50.2;

    // ONS altın (USD)
    let onsUSD = 3000;
    try {
      const gold = await fetchJSON('https://open.er-api.com/v6/latest/XAU');
      if (gold.rates && gold.rates.USD) onsUSD = 1 / gold.rates.USD;
    } catch(e) {}

    // Gram altın TL
    const gramAltinTL = (onsUSD / 31.1035) * tryRate;

    res.status(200).json({
      usd:   parseFloat(tryRate.toFixed(2)),
      eur:   parseFloat(eurTry.toFixed(2)),
      altin: parseFloat(gramAltinTL.toFixed(2)),
      ons:   parseFloat(onsUSD.toFixed(2)),
      kaynak: 'open.er-api.com',
      zaman: new Date().toISOString()
    });

  } catch (e) {
    res.status(200).json({
      usd: 42.8, eur: 50.2, altin: 7100, ons: 3000,
      kaynak: 'fallback', zaman: new Date().toISOString()
    });
  }
};
