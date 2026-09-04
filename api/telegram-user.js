const crypto = require("crypto");

function verifyTelegramInitData(initData, botToken) {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a],[b]) => a.localeCompare(b))
    .map(([key,value]) => key + "=" + value)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(calculatedHash), Buffer.from(hash))) {
    return null;
  }

  const authDate = Number(params.get("auth_date") || 0);
  if (!authDate || Math.floor(Date.now()/1000) - authDate > 86400) return null;

  try { return JSON.parse(params.get("user") || "{}"); }
  catch { return null; }
}

module.exports = (req,res) => {
  if(req.method !== "POST") return res.status(405).json({error:"Method not allowed"});
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if(!botToken) return res.status(500).json({error:"Telegram bot token is not configured"});
  const initData = req.body && req.body.initData;
  if(!initData) return res.status(400).json({error:"Missing initData"});
  const user = verifyTelegramInitData(initData, botToken);
  if(!user || !user.id) return res.status(401).json({error:"Invalid Telegram data"});
  return res.status(200).json({user});
};