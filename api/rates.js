export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  // Virgüllü gelme ihtimaline karşı güvenli sayı çevirici
  const parseNum = (val) => parseFloat(val.toString().replace(',', '.')) || 0;

  try {
    // Doğrudan Türkiye piyasasını veren API (ONS hesabı YOK)
    const response = await fetch('https://api.genelpara.com/embed/para-birimleri.json', {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();

    // GA = Doğrudan Serbest Piyasa Gram Altın
    const gramAltin = parseNum(data.GA.satis);
    const usd = parseNum(data.USD.satis);
    const eur = parseNum(data.EUR.satis);
    const ons = parseNum(data.ONS.satis);

    if (gramAltin === 0) throw new Error("Veri sıfır geldi");

    return res.status(200).json({
      usd: usd,
      eur: eur,
      altin: gramAltin, // Dümdüz, net Gram Altın fiyatı
      ons: ons,
      kaynak: 'turkiye-direkt-piyasa',
      zaman: new Date().toISOString()
    });

  } catch (err) {
    // API anlık cevap vermezse proje çökmesin diye yedek
    return res.status(200).json({
      usd: 44.75, eur: 52.80, altin: 3700, ons: 2450,
      kaynak: 'hata-kurtarma',
      mesaj: 'Canlı veriye ulaşılamadı.'
    });
  }
}
