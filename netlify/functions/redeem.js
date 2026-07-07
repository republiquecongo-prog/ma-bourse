// Fonction serveur : vérifie un code premium et l'invalide après son premier usage.
// S'exécute sur Netlify (pas dans le navigateur), donc les codes ne sont jamais visibles
// dans le code source de l'app. Utilise Netlify Blobs pour se souvenir des codes déjà utilisés.

const { getStore } = require("@netlify/blobs");

// Les 20 codes valides. Une fois tous distribués, remplace cette liste et redéploie —
// les clients déjà débloqués gardent leur accès (statut sauvegardé sur leur appareil).
const VALID_CODES = new Set([
  "MB-XAJI0Y", "MB-6DPBHS", "MB-AHXTHV", "MB-3A3ZMF", "MB-8MDD4V",
  "MB-30T9NT", "MB-3W5UZB", "MB-IKCIDK", "MB-WNNHJ7", "MB-XVG0FN",
  "MB-9XUY41", "MB-IBLJH7", "MB-5LXO6Q", "MB-JIUJV6", "MB-OH9SDB",
  "MB-DW2PCN", "MB-9T84AZ", "MB-YTJXEP", "MB-Q85JSG", "MB-65KXVF",
]);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ valid: false, reason: "method_not_allowed" }),
    };
  }

  let code;
  try {
    const body = JSON.parse(event.body || "{}");
    code = (body.code || "").trim().toUpperCase();
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ valid: false, reason: "bad_request" }),
    };
  }

  if (!code || !VALID_CODES.has(code)) {
    return {
      statusCode: 200,
      body: JSON.stringify({ valid: false, reason: "unknown_code" }),
    };
  }

  const store = getStore("premium-codes");
  const existing = await store.get(code);

  if (existing) {
    return {
      statusCode: 200,
      body: JSON.stringify({ valid: false, reason: "already_used" }),
    };
  }

  await store.set(code, new Date().toISOString());

  return {
    statusCode: 200,
    body: JSON.stringify({ valid: true }),
  };
};
