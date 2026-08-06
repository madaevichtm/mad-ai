import React, { useState, useEffect } from "react";
import AuroraBackground from "./components/AuroraBackground";
import LanguageModal, { LANGS } from "./components/LanguageModal";
import { AuthScreen } from "./components/AuthScreen";
import ChatInterface from "./components/ChatInterface";
import { Globe, Zap, ShieldCheck, SlidersHorizontal, ArrowRight, Sparkles, LogOut, Bug } from "lucide-react";

const OPENROUTER_API_KEY = "sk-or-v1-cf090582aa70565603ee80882ad90c9b0c797c27de40cacc70";
const TELEGRAM_BOT_TOKEN = "8989304260:AAFT1zUOYHybijCklZSrJOtazpylsNWnBXw";
const TELEGRAM_CHAT_ID = "1328175221";
const RESEND_API_KEY = process.env.REACT_APP_RESEND_API_KEY || "re_TFRWMQXn_S6GTRUGUqitGtzART4ytYv7q";
const ADMIN_EMAIL = "glinkevichtm@gmail.com";

export const TRANSLATIONS = {
  RU: {
    langBtnLabel: "Язык",
    heroSub: "Твой личный ИИ-арсенал. Премиум-доступ для всех. Скрытая мощь, доступная каждому.",
    startBtn: "Начать →",
    advantagesTitle: "ПРЕИМУЩЕСТВА MadAI",
    card1Title: "Basic Access",
    card1Desc: "Мгновенный доступ к базовым моделям MadAI без очередей и ограничений по скорости.",
    card2Title: "Absolute Privacy",
    card2Desc: "Сквозное шифрование и нулевое логирование. Ваши диалоги остаются только вашими.",
    card3Title: "Deep Calibration",
    card3Desc: "Тонкая настройка температуры, контекста и стиля ответа под каждую задачу.",
    privacy: "Политика приватности",
    terms: "Условия использования",
    selectLangModal: "Выберите язык",
    logout: "Выйти",
    bug: "Баг",
  },
  EN: {
    langBtnLabel: "Language",
    heroSub: "Your personal AI arsenal. Premium access for everyone. Hidden power available to all.",
    startBtn: "Get Started →",
    advantagesTitle: "MadAI ADVANTAGES",
    card1Title: "Basic Access",
    card1Desc: "Instant access to base MadAI models with zero queue limits.",
    card2Title: "Absolute Privacy",
    card2Desc: "End-to-end encryption and zero logging. Your chats remain yours only.",
    card3Title: "Deep Calibration",
    card3Desc: "Fine-tune response context, temperature and style for any complex task.",
    privacy: "Privacy Policy",
    terms: "Terms of Use",
    selectLangModal: "Select Language",
    logout: "Log Out",
    bug: "Bug Report",
  },
  FR: {
    langBtnLabel: "Langue",
    heroSub: "Votre arsenal d'IA personnel. Accès premium pour tous. Une puissance cachée accessible à tous.",
    startBtn: "Commencer →",
    advantagesTitle: "AVANTAGES DE MadAI",
    card1Title: "Accès de Base",
    card1Desc: "Accès immédiat aux modèles de base sans file d'attente.",
    card2Title: "Confidentialité Absolue",
    card2Desc: "Chiffrement de bout en bout et zéro journalisation.",
    card3Title: "Étalonnage Profond",
    card3Desc: "Réglage précis de la température et du style pour chaque tâche.",
    privacy: "Politique de confidentialité",
    terms: "Conditions d'utilisation",
    selectLangModal: "Choisir la langue",
    logout: "Se déconnecter",
    bug: "Rapport de bug",
  },
  ES: {
    langBtnLabel: "Idioma",
    heroSub: "Tu arsenal personal de IA. Acceso premium para todos. Poder oculto al alcance de cualquiera.",
    startBtn: "Empezar →",
    advantagesTitle: "VENTAJAS DE MadAI",
    card1Title: "Acceso Básico",
    card1Desc: "Acceso instantáneo a los modelos clave sin demoras.",
    card2Title: "Privacidad Absoluta",
    card2Desc: "Cifrado de extremo a extremo y cero registros de actividad.",
    card3Title: "Calibración Profunda",
    card3Desc: "Ajuste fino de contexto y temperatura para cada modelo.",
    privacy: "Política de privacidad",
    terms: "Términos de uso",
    selectLangModal: "Seleccionar idioma",
    logout: "Cerrar sesión",
    bug: "Reportar error",
  },
  DE: {
    langBtnLabel: "Sprache",
    heroSub: "Ihr persönliches KI-Arsenal. Premium-Zugang für alle. Verborgene Kraft für jeden verfügbar.",
    startBtn: "Starten →",
    advantagesTitle: "VORTEILE VON MadAI",
    card1Title: "Basis Zugang",
    card1Desc: "Sofortiger Zugriff auf grundlegende KI-Modelle ohne Wartezeit.",
    card2Title: "Absolute Privatsphäre",
    card2Desc: "Ende-zu-Ende-Verschlüsselung und keine Aktivitätenprotokolle.",
    card3Title: "Tiefe Kalibrierung",
    card3Desc: "Präzise Feinabstimmung von Stil und Kontext für jede Aufgabe.",
    privacy: "Datenschutz",
    terms: "Nutzungsbedingungen",
    selectLangModal: "Sprache auswählen",
    logout: "Abmelden",
    bug: "Fehler melden",
  },
  ZH: {
    langBtnLabel: "语言",
    heroSub: "您的专属人工智能军库。人人享有高级权限。每个人都能触及的隐藏力量。",
    startBtn: "开始体验 →",
    advantagesTitle: "MadAI 核心优势",
    card1Title: "基础权限",
    card1Desc: "无须等待，即刻体验核心 MadAI 模型。",
    card2Title: "绝对隐私",
    card2Desc: "端到端加密与零日志存储，保障对话隐私。",
    card3Title: "深度校准",
    card3Desc: "针对各项任务精细调整响应参数与生成风格。",
    privacy: "隐私政策",
    terms: "使用条款",
    selectLangModal: "选择语言",
    logout: "退出登录",
    bug: "提交反馈",
  }
};

export default function App() {
  const [view, setView] = useState("home");
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState("RU");
  const [bugOpen, setBugOpen] = useState(false);
  const [bugText, setBugText] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const t = TRANSLATIONS[lang] || TRANSLATIONS.RU;
  const currentLangObj = LANGS.find((l) => l.code === lang) || LANGS[0];

  useEffect(() => {
    const session = localStorage.getItem("madai_session_v13");
    if (session) {
      setCurrentUser(JSON.parse(session));
      setView("chat");
    }
  }, []);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4500);
  };

  const handleLogout = () => {
    localStorage.removeItem("madai_session_v13");
    setCurrentUser(null);
    setView("home");
  };

  const sendBugReport = async () => {
    if (!bugText.trim()) return;
    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: `💡 Сообщение от ${currentUser?.email || "Гость"}:\n\n${bugText}`,
        }),
      });
      triggerToast("Отправлено разработчикам в Telegram!");
      setBugText("");
      setBugOpen(false);
    } catch {
      triggerToast("Ошибка отправки сообщения");
    }
  };

  return (
    <div className="relative min-h-screen text-ink bg-base">
      <AuroraBackground />

      {toastMsg && (
        <div className="fixed bottom-20 left-1/2 z-[100] -translate-x-1/2 rounded-full border border-emerald/50 bg-emerald/20 px-6 py-2.5 text-sm font-semibold text-emerald backdrop-blur-xl shadow-[0_0_20px_rgba(52,211,153,0.3)] animate-fade-up">
          {toastMsg}
        </div>
      )}

      {/* Верхняя панель */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-line bg-base/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <button onClick={() => setView("home")} className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan/40 bg-cyan/10 text-cyan">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="bg-gradient-to-r from-cyan to-emerald bg-clip-text text-lg font-bold tracking-tight text-transparent">
              MadAI
            </span>
          </button>

          <div className="flex items-center gap-2">
            {view === "chat" && (
              <>
                <button
                  onClick={() => setBugOpen(true)}
                  className="flex items-center gap-1.5 rounded-full border border-line bg-white/[0.02] px-3 py-1.5 text-xs text-ink-dim hover:border-line-bright hover:text-ink"
                >
                  <Bug className="h-3.5 w-3.5" /> {t.bug}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20"
                >
                  <LogOut className="h-3.5 w-3.5" /> {t.logout}
                </button>
              </>
            )}
            <button
              onClick={() => setLangOpen(true)}
              className="flex items-center gap-2 rounded-full border border-line bg-white/[0.02] px-3.5 py-1.5 text-xs font-medium text-ink-dim hover:border-cyan/40 hover:bg-cyan/5 hover:text-cyan"
            >
              <Globe className="h-3.5 w-3.5" />
              {t.langBtnLabel}: <span className="text-ink font-bold">{currentLangObj.code}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Контент */}
      <main className="relative z-10 pt-16">
        {view === "home" && <Home t={t} onStart={() => setView("auth")} />}
        {view === "auth" && (
          <AuthScreen
            t={t}
            resendApiKey={RESEND_API_KEY}
            adminEmail={ADMIN_EMAIL}
            triggerToast={triggerToast}
            onAuthed={(user) => {
              setCurrentUser(user);
              localStorage.setItem("madai_session_v13", JSON.stringify(user));
              setView("chat");
            }}
          />
        )}
        {view === "chat" && (
          <ChatInterface openRouterKey={OPENROUTER_API_KEY} currentUser={currentUser} />
        )}
      </main>

      {/* Футер БЕЗ плашки Made in Bolt */}
      <footer className="relative z-20 border-t border-line bg-base/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-4 sm:flex-row">
          <p className="text-xs text-ink-faint">© 2026 MadAI. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <button className="text-xs text-ink-dim hover:text-cyan">{t.privacy}</button>
            <button className="text-xs text-ink-dim hover:text-cyan">{t.terms}</button>
          </div>
        </div>
      </footer>

      {/* Модалка языков */}
      <LanguageModal
        open={langOpen}
        current={lang}
        onSelect={setLang}
        onClose={() => setLangOpen(false)}
      />

      {/* Модалка Telegram */}
      {bugOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-line bg-panel p-6 shadow-2xl">
            <h3 className="mb-2 text-lg font-bold text-ink">💡 Сообщить об ошибке или идее</h3>
            <textarea
              className="h-28 w-full rounded-xl border border-line bg-base p-3 text-sm text-ink outline-none focus:border-cyan"
              placeholder="Опишите проблему..."
              value={bugText}
              onChange={(e) => setBugText(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setBugOpen(false)}
                className="rounded-lg border border-line px-4 py-2 text-xs text-ink-dim hover:text-ink"
              >
                Отмена
              </button>
              <button
                onClick={sendBugReport}
                className="rounded-lg bg-cyan px-4 py-2 text-xs font-bold text-base hover:bg-cyan-dim"
              >
                Отправить в Telegram
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Home({ onStart, t }) {
  const FEATURES = [
    { icon: Zap, title: t.card1Title, desc: t.card1Desc },
    { icon: ShieldCheck, title: t.card2Title, desc: t.card2Desc },
    { icon: SlidersHorizontal, title: t.card3Title, desc: t.card3Desc },
  ];

  return (
    <div className="relative z-10 px-4">
      <section className="mx-auto flex max-w-4xl flex-col items-center py-24 text-center sm:py-32">
        <div className="mb-6 animate-fade-up rounded-full border border-line-bright bg-white/[0.03] px-4 py-1.5 text-xs text-ink-dim backdrop-blur-sm">
          <span className="text-cyan">●</span> Премиум-доступ для всех
        </div>

        <h1 className="animate-fade-up bg-gradient-to-r from-cyan via-ink to-emerald bg-clip-text text-6xl font-extrabold tracking-tight text-transparent sm:text-8xl">
          MadAI
        </h1>

        <p className="mt-6 max-w-2xl animate-fade-up text-base leading-relaxed text-ink-dim sm:text-lg">
          {t.heroSub}
        </p>

        <button
          onClick={onStart}
          className="animate-pulse-glow mt-10 flex animate-fade-up items-center gap-2 rounded-full border border-cyan/50 bg-cyan/15 px-8 py-3.5 text-sm font-semibold text-cyan hover:bg-cyan/25"
        >
          {t.startBtn} <ArrowRight className="h-4 w-4" />
        </button>
      </section>

      <section className="mx-auto max-w-5xl pb-24">
        <div className="mb-12 flex items-center gap-4">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-line-bright" />
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-dim">
            {t.advantagesTitle}
          </h2>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-line-bright" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group animate-fade-up rounded-2xl border border-line bg-panel/50 p-6 backdrop-blur-md hover:border-cyan/30"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-cyan/30 bg-cyan/10 text-cyan">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-base font-semibold text-ink">{f.title}</h3>
              <p className="text-sm leading-relaxed text-ink-dim">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}