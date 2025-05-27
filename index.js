const axios = require("axios");
const Jimp = require("jimp").default;
const TelegramBot = require("node-telegram-bot-api");
const jsQR = require("jsqr");

// === CONFIG ===
const IMAGE_URL =
  "https://streaming.beelinetv.uz/live_preview/beelinetvuz/11.jpeg";
const TELEGRAM_BOT_TOKEN = "7297298174:AAENdf1k5KGQCL_24786lBp5LRQddK6Gw04";
const TELEGRAM_CHAT_ID_FARANGIZ = "1996750895"; //Farangiz: 1996750895
const TELEGRAM_CHAT_ID_OYIM = "8084488910"; //Oyim: 8084488910
const TELEGRAM_CHAT_ID_JK = "292438799"; //JK: 292438799

// === INIT TELEGRAM BOT ===
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

// === LAST QR MEMORY (to avoid duplicates) ===
let lastQR = null;

// === FUNCTION TO FETCH IMAGE FROM URL AND DECODE QR ===
async function fetchAndScanImage() {
  try {
    // Download image from URL
    const response = await axios.get(IMAGE_URL, {
      responseType: "arraybuffer",
    });
    const image = await Jimp.read(response.data);

    console.log(
      "Loaded image from URL:",
      image.bitmap.width,
      "x",
      image.bitmap.height
    );

    const { data, width, height } = image.bitmap;
    const rgbaPixels = new Uint8ClampedArray(data.buffer);

    const code = jsQR(rgbaPixels, width, height);

    if (code?.data) {
      const qrText = code.data;

      if (qrText !== lastQR) {
        lastQR = qrText;
        console.log("QR Code Found:", qrText);

        try {
          await bot.sendMessage(
            TELEGRAM_CHAT_ID_FARANGIZ,
            `🎯 QR Code Detected:\n${qrText}`
          );
          await bot.sendMessage(
            TELEGRAM_CHAT_ID_OYIM,
            `🎯 QR Code Detected:\n${qrText}`
          );
          await bot.sendMessage(
            TELEGRAM_CHAT_ID_JK,
            `🎯 QR Code Detected:\n${qrText}`
          );
          console.log("Sent message to Telegram.");
        } catch (tgError) {
          console.error("Telegram error:", tgError.message || tgError);
        }
      } else {
        console.log("QR code already sent, skipping...");
      }
    } else {
      console.log(new Date().toLocaleTimeString(), "No QR code detected.");
    }
  } catch (err) {
    console.error(
      new Date().toLocaleTimeString(),
      "Error:",
      err.message || err
    );
  }
}

// === RUN EVERY 5 SECONDS ===
setInterval(fetchAndScanImage, 60 * 1000);
console.log("Remote QR scanner started... checking every 60 seconds.");
