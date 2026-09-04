// Secure Telegram Mini App verification.
// Configure BOT_TOKEN in Vercel Environment Variables.
const crypto = require('crypto');

function verify(initData, botToken) {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => k + '=' + v)
    .join('\n');

  const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const expected = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');

  if (hash.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expected))) return null;

  const authDate = Number(params.get('auth_date') || 0);
  if (!authDate || Math.floor(Date.now() / 1000) - authDate > 86400) return null;

  try { return JSON.parse(params.get('user') || '{}'); } catch { return null; }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  const token = process.env.BOT_TOKEN;
  if (!token) return res.status(500).json({error:'BOT_TOKEN is not configured'});

  try {
    const body = req.body || {};
    const user = verify(body.initData, token);
    if (!user) return res.status(401).json({error:'Invalid or expired Telegram data'});
    res.status(200).json({user:{
      id:user.id,
      first_name:user.first_name || '',
      last_name:user.last_name || '',
      username:user.username || ''
    }});
  } catch {
    res.status(400).json({error:'Invalid request'});
  }
};
