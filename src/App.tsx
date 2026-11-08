import { useEffect, useState, useCallback, useRef } from "react";
import ganpatiImg from "./assets/Ganpati.png";
import laxmiImg from "./assets/Laxmiji.png";
import { Diya } from "./components/Diya";
import { FloatingPetals } from "./components/FloatingPetals";
import { Rangoli } from "./components/Rangoli";
import { StarField } from "./components/StarField";
import { Toran } from "./components/Toran";
import { Fireworks } from "./components/Fireworks";
import { GoldenParticles } from "./components/GoldenParticles";

/* ── Content strings ── */
const T = {
  gu: {
    badge:       "॥ શ્રી ગણેશાય નમઃ 🙏 ॥",
    title:       "શુભ દીપાવલી",
    sub:         "કુચારા પરિવાર તરફથી",
    greet1:      "આપ સૌને અને આપના સમગ્ર પરિવારને",
    greet2:      "દિવાળીના પાવન પર્વની હાર્દિક શુભકામનાઓ!",
    ganesh:      "ૐ ગં ગણપતયે નમઃ",
    ganeshVerse: "વક્રતુંડ મહાકાય, સૂર્યકોટિ સમપ્રભ।\nનિર્વિઘ્નં કુરુ મે દેવ, સર્વકાર્યેષુ સર્વદા॥",
    lakshmi:     "ૐ શ્રીં મહાલક્ષ્મ્યૈ નમઃ",
    lakshmiDesc: "માતા લક્ષ્મીની કૃપાથી ઘરમાં ધન,\nસુખ, સમૃદ્ધિ અને આનંદ રહે.",
    from:        "સ્નેહપૂર્વક,",
    family:      "કુચારા પરિવાર",
    wish:        "આપ સૌને દિવાળી તથા નૂતન વર્ષાભિનંદન! 🎉",
    btnFire:     "🎆 ઉત્સવ મનાવો",
    btnShare:    "🔗 શેર કરો",
    btnCopied:   "✅ કૉપી થઈ ગયો!",
  },
  en: {
    badge:       "॥ Shri Ganeshaya Namah 🙏 ॥",
    title:       "Shubh Deepawali",
    sub:         "From Kuchara Parivaar",
    greet1:      "To you and your entire family,",
    greet2:      "Heartfelt Diwali Greetings & Blessings!",
    ganesh:      "Om Gam Ganapataye Namah",
    ganeshVerse: "Vakratunda Mahakaya, Suryakoti Samaprabha.\nNirvighnam Kuru Me Deva, Sarvakaryeshu Sarvada॥",
    lakshmi:     "Om Shreem Mahalakshmyai Namah",
    lakshmiDesc: "May Goddess Lakshmi bless your home\nwith wealth, peace & endless joy.",
    from:        "With love,",
    family:      "Kuchara Parivaar",
    wish:        "Happy Diwali & Happy New Year! 🎉",
    btnFire:     "🎆 Celebrate",
    btnShare:    "🔗 Share",
    btnCopied:   "✅ Copied!",
  },
} as const;

type Lang = "gu" | "en";

/* ── Hide loading overlay ── */
function useLoadingOverlay() {
  useEffect(() => {
    const el = document.getElementById("loading-overlay");
    if (!el) return;
    const t = setTimeout(() => el.classList.add("hidden"), 1800);
    return () => clearTimeout(t);
  }, []);
}

/* ── Share ── */
async function handleShare(lang: Lang) {
  const t = T[lang];
  const data = {
    title: t.title + " – " + t.family,
    text:  t.greet2 + " 🪔✨",
    url:   window.location.href,
  };
  if (navigator.share) {
    try { await navigator.share(data); } catch (_) { /* cancelled */ }
  } else {
    await navigator.clipboard.writeText(`${data.text}\n${data.url}`);
    alert(lang === "gu" ? "શુભકામના સંદેશ કૉપી થઈ ગયો! 🎉" : "Wishes copied! 🎉");
  }
}

export default function App() {
  useLoadingOverlay();

  const [lang, setLang]               = useState<Lang>("gu");
  const [fireworkTrigger, setFire]    = useState(0);
  const [copied, setCopied]           = useState(false);

  const t = T[lang];

  /* ── Pointer tilt ── */
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, scale: 1 });
  const rafRef = useRef<number>(0);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2);
    const dy = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2);
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() =>
      setTilt({ rx: -dy * 10, ry: dx * 10, scale: 1.035 })
    );
  }, []);

  const onPointerLeave = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setTilt({ rx: 0, ry: 0, scale: 1 });
  }, []);

  const triggerFireworks = useCallback(() => setFire(n => n + 1), []);

  const onShare = useCallback(async () => {
    await handleShare(lang);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [lang]);

  return (
    <div className="page-root">

      {/* ── Blurred background ── */}
      <div className="bg-layer" aria-hidden="true">
        <div className="bg-gradient" />
        <StarField />
        <FloatingPetals />
        <GoldenParticles />
        <div className="bg-rangoli bg-rangoli-l"><Rangoli size={380} spin /></div>
        <div className="bg-rangoli bg-rangoli-r"><Rangoli size={380} spin /></div>
        <div className="bg-blur" />
      </div>

      {/* ── Language toggle — top-right above card ── */}
      <div className="lang-toggle anim-0" role="group" aria-label="Language">
        <button
          className={`lang-btn ${lang === "gu" ? "lang-active" : ""}`}
          onClick={() => setLang("gu")}
        >ગુ</button>
        <span className="lang-sep">|</span>
        <button
          className={`lang-btn ${lang === "en" ? "lang-active" : ""}`}
          onClick={() => setLang("en")}
        >EN</button>
      </div>

      {/* ── Single Card ── */}
      <div
        ref={cardRef}
        className="diwali-card"
        style={{
          transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${tilt.scale})`,
          transition: tilt.scale === 1 ? "transform .6s cubic-bezier(.22,1,.36,1)" : "transform .08s linear",
        }}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        <Fireworks trigger={fireworkTrigger} />
        <div className="card-toran"><Toran /></div>
        <div className="corner-rangoli corner-tl"><Rangoli size={110} /></div>
        <div className="corner-rangoli corner-tr"><Rangoli size={110} /></div>
        <div className="corner-rangoli corner-bl"><Rangoli size={110} /></div>
        <div className="corner-rangoli corner-br"><Rangoli size={110} /></div>

        <div className="card-body">

          <span className={`badge anim-1 ${lang === "gu" ? "guj" : ""}`}>{t.badge}</span>

          <h1 className={`card-title gold-text anim-2 ${lang === "gu" ? "guj" : "cinzel"}`}>
            {t.title}
          </h1>

          <p className={`card-sub anim-3 ${lang === "gu" ? "guj" : ""}`}>{t.sub}</p>

          <div className="ornament-line anim-3" />

          <div className="diya-wrap anim-4">
            <div className="diya-ring animate-pulse-glow" />
            <Diya size={120} interactive glowColor="#FFD700" className="relative z-10" />
            {[0,60,120,180,240,300].map(deg => (
              <div key={deg} className="spark animate-twinkle"
                style={{ transform: `rotate(${deg}deg) translateY(-72px)`, animationDelay: `${deg/300}s` }} />
            ))}
          </div>

          <div className="greeting anim-5">
            <p className={`greeting-line ${lang === "gu" ? "guj" : ""}`}>{t.greet1}</p>
            <p className={`greeting-line gold-line ${lang === "gu" ? "guj" : ""}`}>{t.greet2}</p>
          </div>

          <div className="spiritual-row anim-6">
            <div className="spirit-block">
              <img src={ganpatiImg} alt="Ganpati" className="deity-img" />
              <p className={`spirit-text ${lang === "gu" ? "guj" : ""}`}>
                <strong>{t.ganesh}</strong>
                {t.ganeshVerse.split("\n").map((l, i) => <span key={i}>{l}<br /></span>)}
              </p>
            </div>
            <div className="spirit-divider" />
            <div className="spirit-block">
              <img src={laxmiImg} alt="Mahalaxmi" className="deity-img" />
              <p className={`spirit-text ${lang === "gu" ? "guj" : ""}`}>
                <strong>{t.lakshmi}</strong>
                {t.lakshmiDesc.split("\n").map((l, i) => <span key={i}>{l}<br /></span>)}
              </p>
            </div>
          </div>

          <div className="signoff anim-8">
            <div className="ornament-line" />
            <p className={`signoff-from ${lang === "gu" ? "guj" : ""}`}>{t.from}</p>
            <h2 className={`gold-text signoff-family animate-glow-text ${lang === "gu" ? "guj" : ""}`}>
              {t.family}
            </h2>
            <p className={`signoff-wish ${lang === "gu" ? "guj" : ""}`}>{t.wish}</p>
            <div className="ornament-line" style={{ marginTop: "0.5rem" }} />
          </div>

          <div className="card-actions anim-8">
            <button className={`btn-gold ${lang === "gu" ? "guj" : ""}`} onClick={triggerFireworks}>
              {t.btnFire}
            </button>
            <button className={`btn-outline ${lang === "gu" ? "guj" : ""}`} onClick={onShare}>
              {copied ? t.btnCopied : t.btnShare}
            </button>
          </div>

        </div>
      </div>

      {/* ── Author watermark — bottom-left below card ── */}
      <div className="author-tag anim-0">
        🪔 Sudhir Kuchara
      </div>

    </div>
  );
}
