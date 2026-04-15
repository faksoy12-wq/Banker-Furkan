export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  // Sayı temizleme: "7.250,50" -> 7250.50
  const parseTR = (val) => {
    if (!val) return 0;
    let s = val.toString().replace(/\./g, '').replace(',', '.');
    return parseFloat(s) || 0;
  };

  try {
    // Türkiye piyasası verilerini en iyi veren kaynaklardan birini deniyoruz
    const response = await fetch('https://finans.truncgil.com/v3/today.json', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    const data = await response.json();

    // DOĞRUDAN GRAM ALTIN ETİKETİNİ ALIYORUZ
    // Truncgil'de bazen "Gram Altın", bazen "GA" olarak geçer.
    const altinObj = data["Gram Altın"] || data["GA"] || data["gold"];
    const gramAltin = parseTR(altinObj?.Selling);
    
    const usd = parseTR(data.USD?.Selling);
    const eur = parseTR(data.EUR?.Selling);

    // Eğer veriler gelmezse hata fırlat ki yedeğe geçsin
    if (gramAltin < 1000) throw new Error("Fiyat çok düşük veya alınamadı");

    return res.status(200).json({
      usd, 
      eur, 
      altin: gramAltin, // İşte istediğin o 7000'li rakam burada
      ons: parseFloat(((gramAltin * 31.1035) / usd).toFixed(2)),
      kaynak: 'turkiye-piyasasi-canli',
      zaman: new Date().toISOString()
    });

  } catch (err) {
    // API cevap vermezse Mangır projesi boş kalmasın diye "Güncel Tahmini" rakamlar
    return res.status(200).json({
      usd: 44.85, 
      eur: 52.95, 
      altin: 7248, // 2026 Nisan ayı için gerçekçi gram altın tahmini
      ons: 5025,
      kaynak: 'tahmini-mod',
      mesaj: "Canlı veriye ulaşılamadı, yaklaşık değerler gösteriliyor."
    });
  }
}
