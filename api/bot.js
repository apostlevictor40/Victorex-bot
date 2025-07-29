const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const { generateSignal } = require('../utils/signalGenerator');

const bot = new Telegraf('7982769821:AAHLDqgaz4_copQLRrObb26ahVtBqSKu0LA');

const assets = [
  "AED/CNY OTC", "AUD/CAD OTC", "CAD/JPY OTC", "EUR/GBP OTC", "KES/USD OTC", "LBP/USD OTC",
  "OMR/CNY OTC", "USD/BRL OTC", "USD/CLP OTC", "USD/COP OTC", "USD/VND OTC", "CHF/NOK OTC",
  "BHD/CNY OTC", "EUR/USD OTC", "USD/ARS OTC", "USD/JPY OTC", "UAH/USD OTC", "SAR/CNY OTC",
  "EUR/TRY OTC", "USD/CNH OTC", "NZD/USD OTC", "USD/RUB OTC", "USD/INR OTC", "EUR/HUF OTC",
  "EUR/USD", "USD/CHF", "CAD/JPY", "CHF/JPY", "CHF/JPY OTC", "USD/BDT OTC", "USD/THB OTC",
  "AUD/CHF", "GBP/JPY", "EUR/JPY", "QAR/CNY OTC", "AUD/CAD", "ZAR/USD OTC", "AUD/USD OTC",
  "EUR/CHF OTC", "AUD/CHF OTC", "EUR/CHF", "GBP/CAD", "GBP/USD OTC", "NZD/JPY OTC", "AUD/JPY",
  "CAD/CHF", "EUR/CAD", "EUR/GBP", "GBP/JPY OTC", "USD/JPY", "YER/USD OTC", "NGN/USD OTC",
  "USD/PHP OTC", "USD/EGP OTC", "EUR/NZD OTC", "GBP/USD", "USD/CAD", "GBP/AUD OTC", "TND/USD OTC",
  "USD/CHF OTC", "USD/IDR OTC", "USD/MYR OTC", "USD/DZD OTC", "AUD/USD", "EUR/AUD", "GBP/AUD",
  "GBP/CHF", "EUR/RUB OTC", "USD/SGD OTC", "USD/CAD OTC", "EUR/JPY OTC", "MAD/USD OTC",
  "USD/PKR OTC", "AUD/JPY OTC", "CAD/CHF OTC", "USD/MXN OTC", "JOD/CNY OTC", "AUD/NZD OTC"
];

const timeframes = ["5s", "10s", "15s", "30s", "1m", "2m", "5m", "10m", "15m", "30m", "1h", "2h", "4h"];

bot.start((ctx) => {
  return ctx.reply("🌐 Please, choose your language:\n\n🌐 Пожалуйста, выберите Ваш язык:", Markup.keyboard([
    ['🇬🇧 English', '🇫🇷 French', '🇵🇹 Portuguese']
  ]).resize());
});

bot.hears(['🇬🇧 English', '🇫🇷 French', '🇵🇹 Portuguese'], (ctx) => {
  ctx.reply(
    `👋 The neural network welcomes you,\n\n🏦 We are sure that you dreamed of learning trading, but something constantly prevented you from doing it? Or did you try hard, but it didn't bring results?\n\n🦄 Are you tired of losing, or do you just want to ease the routine and earn the first million?\n\n❌ It doesn't matter! We already have a solution to all your problems - Victorex binary signal bot.`,
    Markup.keyboard([['📊 Get Signal']]).resize()
  );
});

bot.hears('📊 Get Signal', (ctx) => {
  showAssets(ctx, 0);
});

function showAssets(ctx, index) {
  const chunk = 6;
  const pageAssets = assets.slice(index, index + chunk);
  const buttons = pageAssets.map((asset) => [asset]);

  if (index + chunk < assets.length) {
    buttons.push(['Next']);
  }

  ctx.reply('📈 Select an asset:', Markup.keyboard(buttons).resize());
  ctx.session = { assetIndex: index };
}

bot.hears('Next', (ctx) => {
  const nextIndex = (ctx.session?.assetIndex || 0) + 6;
  showAssets(ctx, nextIndex);
});

bot.on('text', async (ctx) => {
  const selectedAsset = ctx.message.text;

  if (assets.includes(selectedAsset)) {
    ctx.session.asset = selectedAsset;
    return ctx.reply('🕒 Select timeframe:', Markup.keyboard(timeframes.map(tf => [tf])).resize());
  }

  if (timeframes.includes(selectedAsset)) {
    const timeframe = selectedAsset;
    const asset = ctx.session.asset;

    const signal = await generateSignal(asset, timeframe);
    return ctx.reply(`✅ Signal for ${asset}\n🕒 Timeframe: ${timeframe}\n📉 Direction: ${signal.direction}\n🎯 Accuracy: ${signal.accuracy}%`);
  }
});

module.exports = bot;
