module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  try {
    // URL'deki 'finans' bazen sorun çıkarabilir, 'finance' daha garantidir
    const data = await fetchJSON('https://finance.truncgil.com/v4/today.json');

    // Truncgil v4'te anahtarlar bazen direkt 'USD' bazen 'USDTRY' olabilir
    const usdData = data['USD'] || data['USDTRY'];
    const eurData = data['EUR'] || data['EURTRY'];
    const altinData = data['gram-altin'] || data['GA'] || data['Gram Altın'];

    const usdVal = parseFloat(usdData?.Buying || 44.75);
    const eurVal = parseFloat(eurData?.Buying || 52.75);
    const altinVal = parseFloat(altinData?.Buying || 7100);
    const onsVal = parseFloat(((altinVal * 31.1035) / usdVal).toFixed(2));

    return res.status(200).json({
      usd: usd,
      USD: usd,
      eur: eur,
      EUR: eur,
      altin: gramAltin,
      ALTIN: gramAltin,
      ons: onsUSD,
      kaynak: 'truncgil',
      zaman: new Date().toISOString(),
    });

  } catch (e) {
    // Hata durumunda en azından Mangır arayüzü çökmesin diye fallback
    return res.status(200).json({
      usd: 44.75, eur: 52.75, altin: 7100, ons: 4935,
      kaynak: 'fallback-error',
      error: e.message
    });
  }
};
