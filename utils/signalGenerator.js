const axios = require('axios');

const TWELVE_DATA_API_KEY = '5c75c9e045b44511b29e2ca8852e8b36';

function mapAssetToSymbol(asset) {
  const symbol = asset.replace(' OTC', '').replace('/', '');
  return symbol.toUpperCase();
}

async function fetchIndicators(symbol, interval) {
  const baseUrl = 'https://api.twelvedata.com';

  try {
    const [rsiRes, macdRes, emaRes] = await Promise.all([
      axios.get(`${baseUrl}/rsi`, {
        params: { symbol, interval, apikey: TWELVE_DATA_API_KEY }
      }),
      axios.get(`${baseUrl}/macd`, {
        params: { symbol, interval, apikey: TWELVE_DATA_API_KEY }
      }),
      axios.get(`${baseUrl}/ema`, {
        params: { symbol, interval, apikey: TWELVE_DATA_API_KEY }
      })
    ]);

    return {
      rsi: parseFloat(rsiRes.data.values?.[0]?.rsi || 50),
      macd: parseFloat(macdRes.data.values?.[0]?.macd || 0),
      macdSignal: parseFloat(macdRes.data.values?.[0]?.signal || 0),
      ema: parseFloat(emaRes.data.values?.[0]?.ema || 0),
    };
  } catch {
    return null;
  }
}

function calculateDirection(indicators) {
  const { rsi, macd, macdSignal } = indicators;
  let direction = '⚖️ Sideways';
  let accuracy = 60;

  if (rsi < 30 && macd > macdSignal) {
    direction = '⬆️ BUY';
    accuracy = 80;
  } else if (rsi > 70 && macd < macdSignal) {
    direction = '⬇️ SELL';
    accuracy = 85;
  } else if (macd > macdSignal) {
    direction = '⬆️ BUY';
    accuracy = 72;
  } else if (macd < macdSignal) {
    direction = '⬇️ SELL';
    accuracy = 72;
  }

  return { direction, accuracy };
}

async function generateSignal(asset, timeframe) {
  const symbol = mapAssetToSymbol(asset);
  const interval = ['5s', '10s', '15s', '30s'].includes(timeframe) ? '1min' : timeframe;

  const indicators = await fetchIndicators(symbol, interval);
  if (!indicators) {
    return { direction: '❌ No data', accuracy: 0 };
  }

  return calculateDirection(indicators);
}

module.exports = { generateSignal };
