// Ma Bourse — version déployable sans étape de build.
// Utilise React + ReactDOM via CDN (voir index.html) et des émojis comme pictogrammes
// (aucune dépendance d'icônes externe, pour rester fiable hors-ligne).

const { useState, useMemo, useEffect, useRef, createElement: h } = React;

const STORAGE_KEY = "ma-bourse-data-v1";
const PREMIUM_KEY = "ma-bourse-premium-v1";

// La vérification des codes se fait maintenant côté serveur (netlify/functions/redeem.js)
// — les codes ne sont plus visibles dans le code source du navigateur.
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/REMPLACE_PAR_TON_LIEN"; // non utilisé pour l'instant (Congo)

function checkPremiumFromSaved() {
  try {
    return localStorage.getItem(PREMIUM_KEY) === "yes";
  } catch (e) {
    return false;
  }
}

function setPremiumSaved(value) {
  try {
    localStorage.setItem(PREMIUM_KEY, value ? "yes" : "no");
  } catch (e) {}
}

function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Ma Bourse — lecture des données impossible :", e);
    return null;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Ma Bourse — sauvegarde impossible :", e);
  }
}

const C = {
  ink: "#22283B",
  gold: "#E3A008",
  coral: "#D95D4A",
  teal: "#1C7C72",
  paper: "#F4F5F2",
  tile: "#FFFFFF",
  muted: "#7A7F8C",
};

const CURRENCIES = [
  { code: "EUR", symbol: "€" },
  { code: "USD", symbol: "$" },
  { code: "GBP", symbol: "£" },
  { code: "XOF", symbol: "CFA" },
  { code: "INR", symbol: "₹" },
  { code: "NGN", symbol: "₦" },
  { code: "BRL", symbol: "R$" },
];

const LANGS = ["fr", "en", "es"];

const T = {
  fr: {
    title: "Ma Bourse", subtitle: "Argent visible, en un coup d'œil",
    balance: "Ce que j'ai", income: "Reçu", expense: "Dépensé",
    chooseCategory: "Choisis une icône", confirm: "Valider", back: "Retour",
    history: "Dernières opérations", noHistory: "Rien pour l'instant. Touche + ou − pour commencer.",
    legend: "chaque pièce =", goal: "Objectif d'épargne", of: "sur", reached: "Objectif atteint !",
    added: "Ajouté !", deletedMsg: "Supprimé", undo: "Annuler",
    premium: "Premium", addGoal: "+ Ajouter un objectif", goalName: "Nom de l'objectif",
    premiumTitle: "Passer à Premium", premiumDesc: "Débloque plusieurs objectifs d'épargne nommés et l'export de tes données en CSV.",
    price: "2 000 FCFA / mois (exemple — à ajuster)", payButton: "Payer avec Stripe", haveCode: "J'ai déjà un code",
    codePlaceholder: "Code premium", validate: "Valider", codeError: "Code invalide", codeUsedError: "Ce code a déjà été utilisé", close: "Fermer",
    export: "Exporter (CSV)", locked: "Réservé à Premium", unlockedMsg: "Premium débloqué !",
    momoTitle: "Comment payer", momoStep1: "Envoie", momoStep2: "au numéro Mobile Money ci-dessous :",
    momoStep3: "Puis écris-nous (WhatsApp ou email) avec ta preuve de paiement — on t'envoie ton code aussitôt.",
    momoWrite: "Nous écrire",
    cats: { food: "Nourriture", transport: "Transport", housing: "Logement", health: "Santé",
      education: "École", gift: "Cadeau", work: "Travail", other_income: "Autre revenu", other_expense: "Autre dépense" },
  },
  en: {
    title: "My Purse", subtitle: "Money you can see, at a glance",
    balance: "What I have", income: "Received", expense: "Spent",
    chooseCategory: "Pick an icon", confirm: "Confirm", back: "Back",
    history: "Recent activity", noHistory: "Nothing yet. Tap + or − to begin.",
    legend: "each coin =", goal: "Savings goal", of: "of", reached: "Goal reached!",
    added: "Added!", deletedMsg: "Deleted", undo: "Undo",
    premium: "Premium", addGoal: "+ Add a goal", goalName: "Goal name",
    premiumTitle: "Upgrade to Premium", premiumDesc: "Unlock several named savings goals and CSV export of your data.",
    price: "2,000 FCFA / month (example — adjust as needed)", payButton: "Pay with Stripe", haveCode: "I already have a code",
    codePlaceholder: "Premium code", validate: "Confirm", codeError: "Invalid code", codeUsedError: "This code was already used", close: "Close",
    export: "Export (CSV)", locked: "Premium only", unlockedMsg: "Premium unlocked!",
    momoTitle: "How to pay", momoStep1: "Send", momoStep2: "to the Mobile Money number below:",
    momoStep3: "Then message us (WhatsApp or email) with your payment proof — we'll send your code right away.",
    momoWrite: "Message us",
    cats: { food: "Food", transport: "Transport", housing: "Housing", health: "Health",
      education: "School", gift: "Gift", work: "Work", other_income: "Other income", other_expense: "Other expense" },
  },
  es: {
    title: "Mi Bolsa", subtitle: "Dinero visible, de un vistazo",
    balance: "Lo que tengo", income: "Recibido", expense: "Gastado",
    chooseCategory: "Elige un ícono", confirm: "Confirmar", back: "Atrás",
    history: "Movimientos recientes", noHistory: "Nada todavía. Toca + o − para empezar.",
    legend: "cada moneda =", goal: "Meta de ahorro", of: "de", reached: "¡Meta alcanzada!",
    added: "¡Añadido!", deletedMsg: "Eliminado", undo: "Deshacer",
    premium: "Premium", addGoal: "+ Añadir una meta", goalName: "Nombre de la meta",
    premiumTitle: "Pasar a Premium", premiumDesc: "Desbloquea varias metas de ahorro con nombre y la exportación de tus datos en CSV.",
    price: "2.000 FCFA / mes (ejemplo — ajustar)", payButton: "Pagar con Stripe", haveCode: "Ya tengo un código",
    codePlaceholder: "Código premium", validate: "Confirmar", codeError: "Código inválido", codeUsedError: "Este código ya fue usado", close: "Cerrar",
    export: "Exportar (CSV)", locked: "Solo Premium", unlockedMsg: "¡Premium desbloqueado!",
    momoTitle: "Cómo pagar", momoStep1: "Envía", momoStep2: "al número Mobile Money de abajo:",
    momoStep3: "Luego escríbenos (WhatsApp o email) con tu comprobante de pago — te enviamos tu código enseguida.",
    momoWrite: "Escribirnos",
    cats: { food: "Comida", transport: "Transporte", housing: "Vivienda", health: "Salud",
      education: "Escuela", gift: "Regalo", work: "Trabajo", other_income: "Otro ingreso", other_expense: "Otro gasto" },
  },
};

const INCOME_CATS = ["work", "gift", "other_income"];
const EXPENSE_CATS = ["food", "transport", "housing", "health", "education", "other_expense"];
const EMOJI = { food: "🍞", transport: "🚌", housing: "🏠", health: "❤️", education: "🎓",
  gift: "🎁", work: "💼", other_income: "🪙", other_expense: "🪙" };

const uid = () => Math.random().toString(36).slice(2, 10);

function niceStep(amount) {
  const a = Math.max(1, Math.abs(amount));
  const steps = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 50000, 100000];
  for (const s of steps) if (a / s <= 14) return s;
  return steps[steps.length - 1];
}

function CoinRow({ amount, color }) {
  const step = niceStep(amount);
  const count = Math.max(0, Math.round(amount / step));
  const shown = Math.min(count, 14);
  return h("div", { className: "flex flex-wrap gap-1.5 text-xl" },
    Array.from({ length: shown }).map((_, i) => h("span", { key: i, style: { filter: `drop-shadow(0 0 0 ${color})` } }, "🪙")),
    count > shown && h("span", { className: "text-xs font-bold self-center", style: { color } }, `+${count - shown}`)
  );
}

function PiggyRow({ pct }) {
  const total = 10;
  const filled = Math.min(total, Math.round((pct / 100) * total));
  return h("div", { className: "flex flex-wrap gap-1.5 text-xl" },
    Array.from({ length: total }).map((_, i) =>
      h("span", { key: i, style: { opacity: i < filled ? 1 : 0.25 } }, "🐷"))
  );
}

function App() {
  const saved = loadSavedState();
  const [lang, setLang] = useState(saved?.lang || "fr");
  const [currency, setCurrency] = useState(
    (saved?.currencyCode && CURRENCIES.find((c) => c.code === saved.currencyCode)) || CURRENCIES.find((c) => c.code === "XOF")
  );
  const [transactions, setTransactions] = useState(saved?.transactions || []);
  const [screen, setScreen] = useState("home");
  const [flow, setFlow] = useState(null);
  const [category, setCategory] = useState(null);
  const [amountStr, setAmountStr] = useState("");
  const [goals, setGoals] = useState(saved?.goals || [{ id: "default", name: null, target: 500, saved: 0 }]);
  const [lastDeleted, setLastDeleted] = useState(null);
  const [premium, setPremium] = useState(checkPremiumFromSaved());
  const [codeInput, setCodeInput] = useState("");
  const [codeErr, setCodeErr] = useState(false);
  const undoTimerRef = useRef(null);

  const t = T[lang];

  // Déblocage automatique si on revient d'un paiement Stripe avec ?premium=paid
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("premium") === "paid") {
      setPremium(true);
      setPremiumSaved(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // Sauvegarde automatique à chaque changement de données
  useEffect(() => {
    saveState({ lang, currencyCode: currency.code, transactions, goals });
  }, [lang, currency, transactions, goals]);

  const balance = useMemo(
    () => transactions.reduce((sum, tx) => sum + (tx.flow === "income" ? tx.amount : -tx.amount), 0),
    [transactions]
  );

  useEffect(() => {
    if (screen === "success") {
      const id = setTimeout(() => setScreen("home"), 900);
      return () => clearTimeout(id);
    }
  }, [screen]);

  function cycleLang() { setLang(LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length]); }
  function startFlow(f) { setFlow(f); setCategory(null); setAmountStr(""); setScreen("categories"); }
  function pickCategory(cat) { setCategory(cat); setScreen("amount"); }
  function pressDigit(d) {
    if (amountStr.length >= 7) return;
    if (d === "." && amountStr.includes(".")) return;
    setAmountStr((s) => s + d);
  }
  function backspace() { setAmountStr((s) => s.slice(0, -1)); }
  function confirmAmount() {
    const amt = parseFloat(amountStr);
    if (!amt || amt <= 0) return;
    setTransactions((prev) => [{ id: uid(), flow, category, amount: amt, date: new Date().toISOString() }, ...prev]);
    setScreen("success");
    setAmountStr("");
  }
  function handleDelete(tx) {
    setTransactions((prev) => prev.filter((x) => x.id !== tx.id));
    setLastDeleted(tx);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => setLastDeleted(null), 4000);
  }
  function undoDelete() {
    if (!lastDeleted) return;
    setTransactions((prev) => [lastDeleted, ...prev]);
    setLastDeleted(null);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
  }

  function updateGoalTarget(id, value) {
    const v = Math.max(0, parseFloat(value) || 0);
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, target: v } : g)));
  }
  function addGoal() {
    if (!premium) { setScreen("premium"); return; }
    setGoals((prev) => [...prev, { id: uid(), name: "", target: 100, saved: 0 }]);
  }
  function updateGoalName(id, name) {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, name } : g)));
  }
  function bumpGoalSaved(id, delta) {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, saved: Math.max(0, (g.saved || 0) + delta) } : g)));
  }
  function removeGoal(id) {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  async function redeemCode() {
    const code = codeInput.trim().toUpperCase();
    if (!code) return;
    try {
      const res = await fetch("/.netlify/functions/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.valid) {
        setPremium(true);
        setPremiumSaved(true);
        setCodeErr(false);
        setScreen("home");
      } else {
        setCodeErr(data.reason === "already_used" ? "used" : true);
      }
    } catch (e) {
      setCodeErr(true);
    }
  }

  function exportCSV() {
    if (!premium) { setScreen("premium"); return; }
    const header = "date,type,categorie,montant,devise\n";
    const rows = transactions.map((tx) =>
      `${tx.date},${tx.flow},${t.cats[tx.category]},${tx.amount},${currency.code}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ma-bourse-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const catList = flow === "income" ? INCOME_CATS : EXPENSE_CATS;
  const flowColor = flow === "income" ? C.gold : C.coral;

  const header = h("header", { className: "flex items-center justify-between mb-6" },
    h("div", null,
      h("h1", { className: "text-2xl font-extrabold" }, t.title),
      h("p", { className: "text-xs", style: { color: C.muted } }, t.subtitle)),
    h("div", { className: "flex items-center gap-2" },
      h("select", {
        value: currency.code,
        onChange: (e) => setCurrency(CURRENCIES.find((c) => c.code === e.target.value)),
        className: "text-sm px-2 py-1.5 rounded-xl border font-bold",
        style: { borderColor: C.ink, backgroundColor: C.tile },
      }, CURRENCIES.map((c) => h("option", { key: c.code, value: c.code }, c.symbol))),
      h("button", {
        onClick: cycleLang,
        className: "p-2 rounded-xl border",
        style: { borderColor: C.ink, backgroundColor: C.tile },
      }, "🌐"),
      h("button", {
        onClick: () => setScreen(premium ? "home" : "premium"),
        className: "px-2 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1",
        style: { borderColor: C.gold, backgroundColor: premium ? C.gold : C.tile, color: premium ? "white" : C.gold },
      }, "⭐", premium ? t.premium : t.premium))
  );

  let body;

  if (screen === "home") {
    body = h(React.Fragment, null,
      h("div", { className: "rounded-3xl p-6 mb-5", style: { backgroundColor: C.tile, boxShadow: "0 2px 0 rgba(34,40,59,0.08)" } },
        h("div", { className: "text-xs uppercase tracking-widest mb-1", style: { color: C.muted } }, t.balance),
        h("div", { className: "text-4xl font-extrabold tabular-nums mb-3", style: { color: balance >= 0 ? C.teal : C.coral } },
          `${currency.symbol}${Math.abs(balance).toFixed(0)}`),
        h(CoinRow, { amount: Math.abs(balance), color: balance >= 0 ? C.teal : C.coral }),
        h("div", { className: "text-[11px] mt-2", style: { color: C.muted } },
          `${t.legend} ${currency.symbol}${niceStep(Math.abs(balance) || 1)}`)
      ),
      goals.map((g, idx) => {
        const isDefault = g.id === "default";
        const progressBase = isDefault ? Math.max(0, balance) : (g.saved || 0);
        const pct = g.target > 0 ? (progressBase / g.target) * 100 : 0;
        return h("div", { key: g.id, className: "rounded-3xl p-6 mb-5", style: { backgroundColor: C.tile, boxShadow: "0 2px 0 rgba(34,40,59,0.08)" } },
          h("div", { className: "flex items-center justify-between mb-1 gap-2" },
            isDefault
              ? h("div", { className: "text-xs uppercase tracking-widest", style: { color: C.muted } }, t.goal)
              : h("input", {
                  value: g.name, placeholder: t.goalName,
                  onChange: (e) => updateGoalName(g.id, e.target.value),
                  className: "text-xs uppercase tracking-widest bg-transparent focus:outline-none flex-1 min-w-0",
                  style: { color: C.muted },
                }),
            h("div", { className: "flex items-center gap-1 text-sm font-bold shrink-0" },
              h("span", { className: "tabular-nums", style: { color: C.teal } }, `${currency.symbol}${progressBase.toFixed(0)}`),
              h("span", { style: { color: C.muted } }, t.of),
              h("span", null, currency.symbol),
              h("input", {
                type: "number", value: g.target,
                onChange: (e) => updateGoalTarget(g.id, e.target.value),
                className: "w-14 text-right border-b bg-transparent tabular-nums focus:outline-none",
                style: { borderColor: C.muted },
              }),
              !isDefault && h("button", { onClick: () => removeGoal(g.id), style: { color: C.muted } }, "🗑")
            )),
          h(PiggyRow, { pct }),
          !isDefault && h("div", { className: "flex gap-2 mt-3" },
            h("button", { onClick: () => bumpGoalSaved(g.id, 10), className: "flex-1 rounded-xl py-2 text-sm font-bold", style: { backgroundColor: C.paper, color: C.teal } }, `+10${currency.symbol}`),
            h("button", { onClick: () => bumpGoalSaved(g.id, -10), className: "flex-1 rounded-xl py-2 text-sm font-bold", style: { backgroundColor: C.paper, color: C.coral } }, `-10${currency.symbol}`)),
          g.target > 0 && progressBase >= g.target && h("div", { className: "text-xs font-bold mt-2", style: { color: C.teal } }, t.reached)
        );
      }),
      h("button", {
        onClick: addGoal,
        className: "w-full mb-6 rounded-2xl py-3 text-sm font-bold flex items-center justify-center gap-2",
        style: { backgroundColor: C.tile, color: premium ? C.teal : C.muted, border: `2px dashed ${premium ? C.teal : C.muted}` },
      }, premium ? t.addGoal : `🔒 ${t.addGoal}`),
      h("div", { className: "grid grid-cols-2 gap-4 mb-6" },
        h("button", {
          onClick: () => startFlow("income"),
          className: "rounded-3xl py-8 flex flex-col items-center gap-2 font-extrabold text-white active:scale-95 transition-transform",
          style: { backgroundColor: C.gold },
        }, h("span", { className: "text-3xl" }, "➕"), h("span", null, t.income)),
        h("button", {
          onClick: () => startFlow("expense"),
          className: "rounded-3xl py-8 flex flex-col items-center gap-2 font-extrabold text-white active:scale-95 transition-transform",
          style: { backgroundColor: C.coral },
        }, h("span", { className: "text-3xl" }, "➖"), h("span", null, t.expense))
      ),
      h("h2", { className: "text-xs uppercase tracking-widest mb-2", style: { color: C.muted } }, t.history),
      transactions.length === 0
        ? h("p", { className: "text-sm p-4 rounded-2xl", style: { backgroundColor: C.tile, color: C.muted } }, t.noHistory)
        : h("div", { className: "space-y-2" }, transactions.map((tx) => {
            const color = tx.flow === "income" ? C.gold : C.coral;
            return h("div", { key: tx.id, className: "flex items-center gap-3 p-3 rounded-2xl", style: { backgroundColor: C.tile } },
              h("div", { className: "rounded-xl p-2 text-xl", style: { backgroundColor: color + "22" } }, EMOJI[tx.category]),
              h("div", { className: "flex-1 min-w-0" },
                h("div", { className: "text-sm font-semibold truncate" }, t.cats[tx.category]),
                h("div", { className: "text-[11px]", style: { color: C.muted } },
                  new Date(tx.date).toLocaleDateString(lang === "fr" ? "fr-FR" : lang === "es" ? "es-ES" : "en-US", { day: "2-digit", month: "2-digit" }))),
              h("div", { className: "font-extrabold tabular-nums", style: { color } },
                `${tx.flow === "income" ? "+" : "-"}${currency.symbol}${tx.amount.toFixed(0)}`),
              h("button", { onClick: () => handleDelete(tx), style: { color: C.muted } }, "🗑"));
          })),
      h("button", {
        onClick: exportCSV,
        className: "w-full mt-4 rounded-2xl py-3 text-sm font-bold flex items-center justify-center gap-2",
        style: { backgroundColor: C.tile, color: premium ? C.ink : C.muted, border: `1px solid ${C.muted}55` },
      }, premium ? `⬇️ ${t.export}` : `🔒 ${t.export}`)
    );
  } else if (screen === "categories") {
    body = h(React.Fragment, null,
      h("button", { onClick: () => setScreen("home"), className: "flex items-center gap-1 text-sm mb-4 font-semibold", style: { color: C.muted } }, "← ", t.back),
      h("h2", { className: "text-lg font-extrabold mb-4 text-center" }, t.chooseCategory),
      h("div", { className: "grid grid-cols-3 gap-3" }, catList.map((cat) =>
        h("button", {
          key: cat, onClick: () => pickCategory(cat),
          className: "rounded-2xl py-5 flex flex-col items-center gap-2 active:scale-95 transition-transform",
          style: { backgroundColor: C.tile, border: `2px solid ${flowColor}` },
        }, h("span", { className: "text-3xl" }, EMOJI[cat]), h("span", { className: "text-[11px] font-bold text-center leading-tight" }, t.cats[cat]))
      ))
    );
  } else if (screen === "amount") {
    body = h(React.Fragment, null,
      h("button", { onClick: () => setScreen("categories"), className: "flex items-center gap-1 text-sm mb-4 font-semibold", style: { color: C.muted } }, "← ", t.back),
      h("div", { className: "flex items-center justify-center gap-2 mb-3" },
        category && h("span", { className: "text-xl" }, EMOJI[category]),
        h("span", { className: "text-sm font-bold" }, category ? t.cats[category] : "")),
      h("div", { className: "text-center text-4xl font-extrabold tabular-nums rounded-2xl py-5 mb-4", style: { backgroundColor: C.tile, color: amountStr ? C.ink : C.muted } },
        `${currency.symbol}${amountStr || "0"}`),
      h("div", { className: "grid grid-cols-3 gap-3" },
        ["1","2","3","4","5","6","7","8","9",".","0","⌫"].map((k) =>
          h("button", {
            key: k, onClick: () => (k === "⌫" ? backspace() : pressDigit(k)),
            className: "rounded-2xl py-5 text-xl font-extrabold active:scale-95 transition-transform",
            style: { backgroundColor: C.tile },
          }, k))
      ),
      h("button", {
        onClick: confirmAmount, disabled: !amountStr || parseFloat(amountStr) <= 0,
        className: "w-full mt-4 rounded-2xl py-4 font-extrabold text-white disabled:opacity-40 active:scale-95 transition-transform",
        style: { backgroundColor: C.teal },
      }, "✓ ", t.confirm)
    );
  } else if (screen === "premium") {
    body = h(React.Fragment, null,
      h("button", { onClick: () => setScreen("home"), className: "flex items-center gap-1 text-sm mb-4 font-semibold", style: { color: C.muted } }, "← ", t.back),
      h("div", { className: "rounded-3xl p-6 text-center", style: { backgroundColor: C.tile } },
        h("div", { className: "text-4xl mb-3" }, "⭐"),
        h("h2", { className: "text-xl font-extrabold mb-2" }, t.premiumTitle),
        h("p", { className: "text-sm mb-4", style: { color: C.muted } }, t.premiumDesc),
        h("div", { className: "text-lg font-extrabold mb-4", style: { color: C.gold } }, t.price),
        h("div", { className: "rounded-2xl p-4 mb-4 text-left", style: { backgroundColor: C.paper } },
          h("div", { className: "text-xs uppercase tracking-widest mb-2 font-bold", style: { color: C.muted } }, t.momoTitle),
          h("p", { className: "text-sm mb-1" }, `${t.momoStep1} ${t.price.split(" (")[0]} ${t.momoStep2}`),
          h("p", { className: "text-lg font-extrabold mb-2", style: { color: C.ink } }, "📱 MTN Mobile Money : +242 06 601 71 66"),
          h("p", { className: "text-xs", style: { color: C.muted } }, t.momoStep3),
          h("a", {
            href: "https://wa.me/242066017166", target: "_blank", rel: "noreferrer",
            className: "block w-full rounded-xl py-3 mt-3 font-bold text-white text-center",
            style: { backgroundColor: C.teal },
          }, t.momoWrite)
        ),
        h("div", { className: "text-xs uppercase tracking-widest mb-2", style: { color: C.muted } }, t.haveCode),
        h("div", { className: "flex gap-2" },
          h("input", {
            value: codeInput, onChange: (e) => { setCodeInput(e.target.value); setCodeErr(false); },
            placeholder: t.codePlaceholder,
            className: "flex-1 px-3 py-2 rounded-xl border text-sm",
            style: { borderColor: codeErr ? C.coral : C.muted },
          }),
          h("button", { onClick: redeemCode, className: "px-4 py-2 rounded-xl font-bold text-white", style: { backgroundColor: C.ink } }, t.validate)
        ),
        codeErr && h("div", { className: "text-xs mt-2 font-bold", style: { color: C.coral } }, codeErr === "used" ? t.codeUsedError : t.codeError)
      )
    );
  } else if (screen === "success") {
    body = h("div", { className: "flex flex-col items-center justify-center py-24 gap-4" },
      h("div", { className: "rounded-full p-6 animate-bounce", style: { backgroundColor: flowColor + "22" } },
        h("span", { className: "text-5xl" }, "✓")),
      h("div", { className: "text-xl font-extrabold", style: { color: flowColor } }, t.added)
    );
  }

  return h("div", { className: "min-h-screen w-full", style: { backgroundColor: C.paper, color: C.ink } },
    h("div", { className: "max-w-md mx-auto px-4 py-6 sm:py-8" }, header, body),
    lastDeleted && h("div", {
      className: "fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg",
      style: { backgroundColor: C.ink, color: "white" },
    },
      h("span", { className: "text-sm font-semibold" }, t.deletedMsg),
      h("button", { onClick: undoDelete, className: "text-sm font-extrabold underline", style: { color: C.gold } }, t.undo))
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(h(App));
