import { useEffect, useState, useCallback, useRef } from "react";
import ganpatiImg from "./assets/Ganpati.png";
import laxmiImg from "./assets/Laxmiji.png";
import sweetsImg from "./assets/sweets.png";
import { Diya } from "./components/Diya";
import { FloatingPetals } from "./components/FloatingPetals";
import { Rangoli } from "./components/Rangoli";
import { StarField } from "./components/StarField";
import { Toran } from "./components/Toran";
import { Fireworks } from "./components/Fireworks";
import { GoldenParticles } from "./components/GoldenParticles";
import { toggleSound, getSoundMuted } from "./utils/sound";

/* ── Content strings ── */
const T = {
  gu: {
    badge: "॥ શ્રી ગણેશાય નમઃ 🙏 ॥",
    title: "શુભ દીપાવલી",
    sub: "",
    greet1: "આપ સૌને અને આપના સમગ્ર પરિવારને",
    greet2: "દિવાળીના પાવન પર્વની હાર્દિક શુભકામનાઓ!",
    ganesh: "ૐ ગં ગણપતયે નમઃ",
    ganeshVerse:
      "વક્રતુંડ મહાકાય, સૂર્યકોટિ સમપ્રભ।\nનિર્વિઘ્નં કુરુ મે દેવ, સર્વકાર્યેષુ સર્વદા॥",
    lakshmi: "ૐ શ્રીં મહાલક્ષ્મ્યૈ નમઃ",
    lakshmiDesc: "માતા લક્ષ્મીની કૃપાથી ઘરમાં ધન,\nસુખ, સમૃદ્ધિ અને આનંદ રહે.",
    from: "સ્નેહપૂર્વક,",
    family: "કુચારા પરિવાર તરફથી",
    wish: "આપ સૌને દિવાળી તથા નૂતન વર્ષાભિનંદન! 🎉",
  },
  en: {
    badge: "॥ Shri Ganeshaya Namah 🙏 ॥",
    title: "HAPPY DIWALI",
    sub: "From Kuchara Family",
    greet1: "To you and your entire family,",
    greet2: "Heartfelt Diwali Greetings & Blessings!",
    ganesh: "Om Gam Ganapataye Namah",
    ganeshVerse:
      "Vakratunda Mahakaya, Suryakoti Samaprabha.\nNirvighnam Kuru Me Deva, Sarvakaryeshu Sarvada॥",
    lakshmi: "Om Shreem Mahalakshmyai Namah",
    lakshmiDesc:
      "May Goddess Lakshmi bless your home\nwith wealth, peace & endless joy.",
    from: "With love,",
    family: "Kuchara Family",
    wish: "Happy Diwali & Happy New Year! 🎉",
  },
} as const;

type Lang = "gu" | "en";

/* ── Hide loading overlay ── */
function useLoadingOverlay() {
  useEffect(() => {
    const el = document.getElementById("loading-overlay");
    if (!el) return;
    const t = setTimeout(() => el.classList.add("hidden"), 1200);
    return () => clearTimeout(t);
  }, []);
}

export default function App() {
  useLoadingOverlay();

  const [lang, setLang] = useState<Lang>("gu");
  const [muted, setMuted] = useState(() => getSoundMuted());
  const t = T[lang];

  const onToggleSound = useCallback(() => {
    const next = toggleSound();
    setMuted(next);
  }, []);

  /* ── Ultra-smooth Mouse Tilt (Bypasses React re-renders; skipped on touch devices for 60fps) ── */
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (card) {
        card.style.transform = `perspective(900px) rotateX(${-dy * 7}deg) rotateY(${dx * 7}deg) scale(1.015)`;
      }
    });
  }, []);

  const onPointerLeave = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const card = cardRef.current;
    if (card) {
      card.style.transform =
        "perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)";
    }
  }, []);

  return (
    <div className="page-root">
      {/* ── High-performance ambient background ── */}
      <div className="bg-layer" aria-hidden="true">
        <div className="bg-gradient" />
        <StarField />
        <FloatingPetals />
        <GoldenParticles />
        <div className="bg-rangoli bg-rangoli-l">
          <Rangoli size={360} spin={false} />
        </div>
        <div className="bg-rangoli bg-rangoli-r">
          <Rangoli size={360} spin={false} />
        </div>
        <div className="bg-blur" />
      </div>

      {/* ── Single Royal Card ── */}
      <div
        ref={cardRef}
        className="diwali-card"
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        <Fireworks />

        {/* Toran header */}
        <div className="card-toran">
          <Toran />
        </div>

        {/* Top ambient illumination beam */}
        <div className="card-light-beam" aria-hidden="true" />

        {/* Decorative corner rangolis */}
        <div className="corner-rangoli corner-tl">
          <Rangoli size={100} />
        </div>
        <div className="corner-rangoli corner-tr">
          <Rangoli size={100} />
        </div>
        <div className="corner-rangoli corner-bl">
          <Rangoli size={100} />
        </div>
        <div className="corner-rangoli corner-br">
          <Rangoli size={100} />
        </div>

        {/* ── Top controls (Sound & Language) ── */}
        <div className="card-top-controls anim-0">
          <button
            className={`sound-btn ${muted ? "sound-muted" : ""}`}
            onClick={onToggleSound}
            aria-label={muted ? "Unmute cracker sound" : "Mute cracker sound"}
            title={muted ? "Unmute cracker sound" : "Mute cracker sound"}
          >
            {muted ? "🔇" : "🔊"}
          </button>
          <div className="lang-toggle" role="group" aria-label="Language">
            <button
              className={`lang-btn ${lang === "gu" ? "lang-active" : ""}`}
              onClick={() => setLang("gu")}
            >
              ગુ
            </button>
            <span className="lang-sep">|</span>
            <button
              className={`lang-btn ${lang === "en" ? "lang-active" : ""}`}
              onClick={() => setLang("en")}
            >
              EN
            </button>
          </div>
        </div>

        {/* ── Card content ── */}
        <div className="card-body">
          {/* 1. Header Group — Spaciously arranged Dipawali title */}
          <div className="card-header-group anim-1">
            <span className={`badge ${lang === "gu" ? "guj" : ""}`}>
              {t.badge}
            </span>
            <br />
            <h1
              className={`card-title gold-text anim-2 ${lang === "gu" ? "guj" : "cinzel"}`}
            >
              {t.title}
            </h1>

            <p className={`card-sub anim-3 ${lang === "gu" ? "guj" : ""}`}>
              {t.sub}
            </p>
          </div>

          <div className="ornament-line anim-3" />

          {/* 2. Sacred Deities (Shree Ganesh & Goddess Lakshmi) */}
          <div className="spiritual-row anim-4">
            <div className="spirit-block">
              <img
                src={ganpatiImg}
                alt="Ganpati"
                className="deity-img"
                loading="eager"
                decoding="async"
              />
              <div className={`spirit-text ${lang === "gu" ? "guj" : ""}`}>
                <strong>{t.ganesh}</strong>
                {t.ganeshVerse.split("\n").map((l, i) => (
                  <span key={i}>
                    {l}
                    <br />
                  </span>
                ))}
              </div>
            </div>
            <div className="spirit-divider" />
            <div className="spirit-block">
              <img
                src={laxmiImg}
                alt="Mahalaxmi"
                className="deity-img"
                loading="eager"
                decoding="async"
              />
              <div className={`spirit-text ${lang === "gu" ? "guj" : ""}`}>
                <strong>{t.lakshmi}</strong>
                {t.lakshmiDesc.split("\n").map((l, i) => (
                  <span key={i}>
                    {l}
                    <br />
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Greeting Box */}
          <div className="greeting anim-5">
            <p className={`greeting-line ${lang === "gu" ? "guj" : ""}`}>
              {t.greet1}
            </p>
            <p
              className={`greeting-line gold-line ${lang === "gu" ? "guj" : ""}`}
            >
              {t.greet2}
            </p>
          </div>

          <div className="ornament-line anim-3" />
          {/* 4. Family Sign-off flanked by Sweets on the left and Dipak on the right */}
          <div className="signoff-row anim-6">
            {/* Left: Sweets PNG */}
            <div
              className="signoff-flank signoff-flank-left"
              title="Diwali Sweets"
            >
              <img
                src={sweetsImg}
                alt="Diwali Sweets"
                className="signoff-sweets-img"
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* Center: Family Sign-off */}
            <div className="signoff-center">
              <p className={`signoff-from ${lang === "gu" ? "guj" : ""}`}>
                {t.from}
              </p>
              <h2
                className={`gold-text signoff-family animate-glow-text ${lang === "gu" ? "guj" : ""}`}
              >
                {t.family}
              </h2>
              <p className={`signoff-wish ${lang === "gu" ? "guj" : ""}`}>
                {t.wish}
              </p>
            </div>

            {/* Right: Clean Dipak image */}
            <div
              className="signoff-flank signoff-flank-right"
              title="Shubh Deep"
            >
              <Diya
                size={48}
                interactive
                glowColor="#FFD700"
                className="relative z-10"
              />
            </div>
          </div>

          {/* 5. Display MADE BY SUDHIR KUCHARA after signoff (bottom-left) */}
          <div className="card-footer-row anim-7">
            <div className="author-tag-bl">
              <span className="author-by">MADE BY</span>
              <span className="author-name">SUDHIR KUCHARA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
