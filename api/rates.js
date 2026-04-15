export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-store, max-age=0');

  try {
        const response = await fetch('https://finance.truncgil.com/api/today.json', {
                headers: { 'User-Agent': 'Mozilla/5.0' }
        });

      const data = await response.json();
        const rates = data.Rates || {};

      const usd = rates.USD?.Selling || 0;
        const eur = rates.EUR?.Selling || 0;
        const gbp = rates.GBP?.Selling || 0;

      const altin = rates.GRA?.Selling || 0;
        const ceyrek = rates.CEYREKALTIN?.Selling || 0;
        const yarim = rates.YARIMALTIN?.Selling || 0;
        const tam = rates.TAMALTIN?.Selling || 0;
        const cumhuriyet = rates.CUMHURIYETALTINI?.Selling || 0;
        const gumus = rates.GUMUS?.Selling || 0;
        const ons = rates.ONS?.Selling || 0;

      const bist = rates.XU100?.Selling || 0;

      const usdChange = rates.USD?.Change || 0;
        const eurChange = rates.EUR?.Change || 0;
        const altinChange = rates.GRA?.Change || 0;
        const onsChange = rates.ONS?.Change || 0;

      const meta = data.Meta_Data || {};

      return res.status(200).json({
              usd, eur, gbp, altin, ons, gumus, bist,
              ceyrek, yarim, tam, cumhuriyet,
              changes: { usd: usdChange, eur: eurChange, altin: altinChange, ons: onsChange },
              meta: { guncelleme: meta.Update_Date || null, dakikaOnce: meta.Minutes_Ago || null },
              kaynak: 'truncgil-v5'
      });

  } catch (error) {
        return res.status(500).json({ 
                                          hata: "Truncgil Finance API'ye baglanilamadi: " + error.message
        });
  }
}
