import { ArrowLeft, ArrowRight, BookOpen, Check, Languages, Play, UserRound } from 'lucide-react'
import { BilingualLogoImage, HomeHeader } from './Home.jsx'

const pages = {
  'bilingual-lessons': {
    eyebrow: 'BILINGUAL VIDEO LESSONS',
    title: 'Learn the rules of the road in both languages.',
    description: 'Clear video lessons will help you understand Italian driving theory and the words you need to talk about it.',
    status: 'Our YouTube channel is coming soon.',
    details: [
      'Explanations in Italian and English',
      'Driving theory, one topic at a time',
      'Videos to revisit whenever you need',
    ],
    icon: Play,
    visualLabel: 'LESSONS IN ITALIAN + ENGLISH',
    visualTitle: 'Video lessons',
    visualText: 'Coming soon to YouTube',
  },
  'individual-lessons': {
    eyebrow: 'INDIVIDUAL ONLINE LESSONS',
    title: 'Personal support from a bilingual instructor.',
    description: 'We’re working on one-to-one online lessons tailored to your goals, your level, and the parts of the driving test you want to practise.',
    status: 'Individual lessons will be available soon.',
    details: [
      'One-to-one support online',
      'An instructor who can help in Italian and English',
      'Practice shaped around your needs',
    ],
    icon: UserRound,
    visualLabel: 'YOUR FUTURE LESSON',
    visualTitle: 'Learn with a tutor',
    visualText: 'Online · Bilingual · Personalised',
  },
}

function ServicePage({ type }) {
  const page = pages[type]
  const Icon = page.icon

  return <div className="home-page">
    <HomeHeader />
    <main className="service-page home-container">
      <a className="service-back-link" href="/"><ArrowLeft size={15} /> Back to home</a>
      <section className={`service-page-hero service-page-${type}`}>
        <div className="service-page-copy">
          <span className="home-eyebrow"><span /> {page.eyebrow}</span>
          <h1>{page.title}</h1>
          <p>{page.description}</p>
          <div className="service-page-status"><span />{page.status}</div>
          <ul>{page.details.map((detail) => <li key={detail}><Check size={15} />{detail}</li>)}</ul>
          <div className="service-page-actions">
            <a className="home-primary-button" href="/quiz/">Practise with quizzes <ArrowRight size={16} /></a>
            <a className="home-text-link" href="/#services">Explore all services <ArrowRight size={15} /></a>
          </div>
        </div>
        <div className="service-page-visual">
          <div className="service-page-orbit service-orbit-one" />
          <div className="service-page-orbit service-orbit-two" />
          <div className="service-visual-card">
            <div className="service-visual-icon"><Icon size={23} /></div>
            <span className="service-visual-label">{page.visualLabel}</span>
            <strong>{page.visualTitle}</strong>
            <small>{page.visualText}</small>
            <div className="service-visual-footer"><span><Languages size={14} /> IT + EN</span><BookOpen size={15} /></div>
          </div>
          <span className="service-visual-spark service-spark-one">✳</span>
          <span className="service-visual-spark service-spark-two">✳</span>
        </div>
      </section>
    </main>
    <footer className="home-footer"><a className="home-brand" href="/" aria-label="Patentish, home"><span className="home-footer-brand-image"><BilingualLogoImage className="home-footer-bilingual-logo" /></span><span>patentish<span className="home-brand-dot">.</span></span></a><span>Learn at your own pace. Drive with confidence.</span><span className="home-footer-notice">Il sito è in fase di completamento e potrebbe contenere errori.<small>Site in progress; some information may contain errors.</small></span><a href="/quiz/">Start practicing <ArrowRight size={14} /></a><a className="home-footer-feedback" href="/quiz/?feedback=1">Segnala un problema<small>Report an issue</small></a><a className="home-footer-feedback" href="/quiz/?account=register">Crea un account gratuito<small>Create a free account</small></a></footer>
  </div>
}

export default ServicePage
