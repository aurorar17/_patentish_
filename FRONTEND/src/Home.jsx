import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CarFront,
  Check,
  ChevronRight,
  Languages,
  Menu,
  Play,
  UserRound,
  X,
} from "lucide-react";

const services = [
  {
    number: "01",
    icon: BookOpen,
    title: "Guided quizzes",
    description:
      "Practice with questions by topic or take a mixed sheet of 30 random quizzes.",
    note: "Available now",
    link: "/quiz/",
  },
  {
    number: "02",
    icon: Play,
    title: "Bilingual video lessons",
    description:
      "Learn Italian driving theory with clear lessons in Italian and English.",
    note: "YouTube channel coming soon",
    link: "/bilingual-lessons/",
    cta: "Explore lessons",
  },
  {
    number: "03",
    icon: UserRound,
    title: "Individual online lessons",
    description:
      "Get personal support from a bilingual instructor in a one-to-one online lesson.",
    note: "Coming soon",
    link: "/individual-lessons/",
    cta: "Learn more",
  },
];

export function BilingualLogoImage({ className }) {
  return (
    <img
      className={className}
      src="/images/bilingual-car-logo.png"
      alt=""
      aria-hidden="true"
    />
  );
}

export function HomeHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="home-header">
      <a className="home-brand" href="/" aria-label="Patentish, home">
        <span className="home-brand-mark-wrap">
          <BilingualLogoImage className="home-bilingual-logo" />
        </span>
        <span>
          patentish<span className="home-brand-dot">.</span>
        </span>
      </a>
      <button
        className="home-menu-toggle"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>
      <nav
        className={menuOpen ? "home-nav is-open" : "home-nav"}
        aria-label="Main navigation"
      >
        <a href="/#services" onClick={() => setMenuOpen(false)}>
          Our services
        </a>
        <a href="/#about" onClick={() => setMenuOpen(false)}>
          About us
        </a>
        <a
          className="home-nav-cta"
          href="/quiz/"
          onClick={() => setMenuOpen(false)}
        >
          Start practicing <ArrowRight size={15} />
        </a>
      </nav>
    </header>
  );
}

function HeroIllustration() {
  return (
    <div className="home-hero-visual home-hero-photo">
      <img
        src="/images/home-driving.jpg"
        alt="A car travelling along a mountain road"
      />
    </div>
  );
}

function Home() {
  return (
    <div className="home-page">
      <HomeHeader />
      <main>
        <section className="home-hero home-container">
          <div className="home-hero-copy">
            <span className="home-eyebrow">
              <span /> ITALIAN DRIVING TEST, STEP BY STEP
            </span>
            <h1>
              Nervous about your driving test?
              <br />
              <em>We’re here to help.</em>
            </h1>
            <p>
              Prepare for the road with clear quizzes and support that adapts to
              you.
            </p>
            <div className="home-hero-actions">
              <a className="home-primary-button" href="/quiz/">
                Go to the quizzes <ArrowRight size={17} />
              </a>
              <a className="home-text-link" href="#services">
                Discover all our services <ChevronRight size={16} />
              </a>
            </div>
            <div className="home-hero-proof">
              <span className="home-proof-icons">
                <Languages size={15} />
                <Check size={15} />
              </span>
              <span>Support in English and Italian</span>
            </div>
          </div>
          <HeroIllustration />
        </section>

        <section className="home-services" id="services">
          <div className="home-container">
            <div className="home-section-heading">
              <span className="home-eyebrow">
                <span /> YOUR NEXT STEP
              </span>
              <h2>
                Discover our services
                <br />
                <em>for your journey.</em>
              </h2>
              <p>
                Everything you need to feel more confident, one step at a time.
              </p>
            </div>
            <div className="home-service-grid">
              {services.map(
                ({
                  number,
                  icon: Icon,
                  title,
                  description,
                  note,
                  link,
                  cta,
                }) => (
                  <article className="home-service-card" key={number}>
                    <div className="home-service-top">
                      <span className="home-service-icon">
                        <Icon size={20} />
                      </span>
                      <span className="home-service-number">{number}</span>
                    </div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                    <a href={link} className="home-service-link">
                      {cta || "Explore quizzes"} <ArrowRight size={15} />
                    </a>
                    <span className="home-service-note">{note}</span>
                  </article>
                ),
              )}
            </div>
          </div>
        </section>

        <section className="home-about home-container" id="about">
          <div className="home-about-art">
            <img src="/images/about-driving.jpg" alt="A mountain road seen from a car" />
            <div className="home-about-card">
              <span className="home-about-card-icon"><CarFront size={26} /></span>
              <span className="home-about-card-label">YOUR JOURNEY</span>
              <strong>Every step<br />takes you closer.</strong>
              <span className="home-about-route"><i /><i /><i /><i /><i /></span>
            </div>
            <a className="home-about-image-cta" href="/quiz/">Start practicing <ArrowRight size={15} /></a>
          </div>
          <div className="home-about-copy">
            <span className="home-eyebrow">
              <span /> ABOUT US
            </span>
            <h2>
              A little support
              <br />
              can take you <em>far.</em>
            </h2>
            <p>
              Patentish was created to make preparing for the Italian driving
              test feel clearer and less stressful. We bring together practical
              quizzes and language support, so you can focus on learning with
              confidence.
            </p>
          </div>
        </section>
      </main>
      <footer className="home-footer">
        <a className="home-brand" href="/" aria-label="Patentish, home">
          <span className="home-footer-brand-image">
            <BilingualLogoImage className="home-footer-bilingual-logo" />
          </span>
          <span>
            patentish<span className="home-brand-dot">.</span>
          </span>
        </a>
        <span>Learn at your own pace. Drive with confidence.</span>
        <span className="home-footer-notice">Il sito è in fase di completamento e potrebbe contenere errori.<small>Site in progress; some information may contain errors.</small></span>
        <a href="/quiz/">
          Start practicing <ArrowRight size={14} />
        </a>
        <a className="home-footer-feedback" href="/quiz/?feedback=1">Segnala un problema<small>Report an issue</small></a>
        <a className="home-footer-feedback" href="/quiz/?account=register">Crea un account gratuito<small>Create a free account</small></a>
      </footer>
    </div>
  );
}

export default Home;
