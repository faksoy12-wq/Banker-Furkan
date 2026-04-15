const API_KEY = '7CPPaolP3BpCSu02sSJC33:0BIxpa4eJIzzZacTA1ZSf6';

const https = require('https');

const fetchJSON = (url) =>
  new Promise((resolve, reject) => {
    const request = https.get(url, {
      headers: {
        'Authorization': `apikey ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    }, (resp) => {
      let raw = '';
      resp.on('data', (chunk) => (raw += chunk));
      resp.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(e); }
      });
    });
    request.on('error', reject);
    request.setTimeout(8000, () => { request.destroy(); reject(new Error('timeout')); });
  });

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  try {
    const [dovizData, altinData] = await Promise.allSettled([
      fetchJSON('https://api.collectapi.com/economy/currencyToAll?int=1&base=USD'),
      fetchJSON('https://api.collectapi.com/economy/goldPrice'),
    ]);

    let usd = 42.8, eur = 50.2;
    if (dovizData.status === 'fulfilled' && dovizData.value?.success) {
      const results = dovizData.value.result;
      const usdRow = results.find(r => r.code === 'USD');
      const eurRow = results.find(r => r.code === 'EUR');
      if (usdRow) usd = parseFloat(usdRow.buying_rate || usdRow.rate);
      if (eurRow) eur = parseFloat(eurRow.buying_rate || eurRow.rate);
    }

    let gramAltin = 7100;
    if (altinData.status === 'fulfilled' && altinData.value?.success) {
      const results = altinData.value.result;
      const gramRow = results.find(r => r.name === 'Gram Altın');
      if (gramRow) gramAltin = parseFloat(gramRow.buying_rate || gramRow.rate);
    }

    const onsUSD = parseFloat(((gramAltin * 31.1035) / usd).toFixed(2));

    return res.status(200).json({
      usd:    parseFloat(usd.toFixed(2)),
      eur:    parseFloat(eur.toFixed(2)),
      altin:  parseFloat(gramAltin.toFixed(2)),
      ons:    onsUSD,
      kaynak: 'collectapi',
      zaman:  new Date().toISOString(),
    });

  } catch (e) {
    return res.status(200).json({
      usd: 42.8, eur: 50.2, altin: 7100, ons: 3020,
      kaynak: 'fallback',
      zaman: new Date().toISOString(),
    });
  }
};
