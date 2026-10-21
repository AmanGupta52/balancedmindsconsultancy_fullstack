import { Link } from "react-router-dom";
import { FiArrowRight, FiShield, FiHeart, FiUsers, FiAward, FiCheckCircle, FiSmile, FiVideo } from "react-icons/fi";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { SERVICES } from "../data/services";
import { TEAM } from "../data/team";
import { FAQS } from "../data/faqs";
import { IMAGES } from "../data/images";
import SmartImage from "../components/ui/SmartImage";
import SectionHead from "../components/ui/SectionHead";
import ServiceIcon from "../components/ui/ServiceIcon";
import Accordion from "../components/ui/Accordion";
import Avatar from "../components/ui/Avatar";
import Reveal from "../components/ui/Reveal";
import WellnessCheck from "../components/assessment/WellnessCheck";
import ClientFeedback from "../components/feedback/ClientFeedback";

const WELLNESS_TOPICS = [
  "Fears & phobias", "Anger management", "Stress management", "Child care", "Dream analysis", "Sleep",
  "Relationship counselling", "Trauma management", "Depression", "Anxiety management", "Migraines",
  "Aches & pains", "Eating disorders", "Body dysmorphia", "Panic disorder",
];
const PSYCH_TOPICS = [
  "Bipolar disorder", "Schizophrenia", "Personality disorders", "Paranoia", "Dissociative disorders",
  "Post-traumatic stress disorder", "Obsessive compulsive disorder",
];

const WHY = [
  { icon: FiAward, title: "Experienced professionals", text: "Qualified psychologists, counsellors and coaches with real-world experience." },
  { icon: FiShield, title: "Confidential space", text: "A safe, private and non-judgmental place where your story is respected." },
  { icon: FiHeart, title: "Personalised care", text: "Sessions shaped around your goals, pace and circumstances." },
  { icon: FiUsers, title: "Whole-person approach", text: "Support for mind, body and relationships - not just symptoms." },
];

export default function HomePage() {
  useDocumentTitle("");

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="container hero__grid">
          <div>
            <span className="eyebrow">Counselling · Coaching · Wellness</span>
            <h1>
              Find your balance with <em>expert guidance</em>
            </h1>
            <p className="hero__lead">
              Get your life back on track with compassionate, confidential support from experienced psychologists and coaches - online or in person in Mumbai.
            </p>
            <div className="hero__cta">
              <Link to="/experts" className="btn btn--primary btn--lg">Book a session <FiArrowRight aria-hidden="true" /></Link>
              <Link to="/contact" className="btn btn--outline btn--lg">Talk to us</Link>
            </div>
            <div className="hero__trust">
              <span><FiCheckCircle aria-hidden="true" /> Confidential</span>
              <span><FiVideo aria-hidden="true" /> Online &amp; in-person</span>
              <span><FiCheckCircle aria-hidden="true" /> Qualified experts</span>
            </div>
          </div>

          <div className="hero__media">
            <SmartImage className="hero__photo" src={IMAGES.hero} alt="A person meditating calmly outdoors" eager icon={FiSmile} />
            <div className="hero__float" aria-hidden="true">
              <span className="card__icon"><FiHeart /></span>
              <div><strong>9+ services</strong><small>for every stage of life</small></div>
            </div>
          </div>
        </div>
      </section>

      {/* TOPICS */}
      <section className="section section--alt" aria-labelledby="topics-title">
        <div className="container">
          <SectionHead eyebrow="How we can help" title="Support for what you're going through">
            We work with a wide range of concerns through our wellness and psychological health programmes.
          </SectionHead>
          <div className="topics">
            <Reveal className="card">
              <h3 id="topics-title"><span className="card__icon" style={{ margin: 0 }}><FiSmile /></span> Wellness &amp; therapy solutions</h3>
              <div className="chip-row">{WELLNESS_TOPICS.map((t) => <span key={t} className="chip">{t}</span>)}</div>
            </Reveal>
            <Reveal className="card" delay={1}>
              <h3><span className="card__icon" style={{ margin: 0 }}><FiShield /></span> Psychological health solutions</h3>
              <div className="chip-row">{PSYCH_TOPICS.map((t) => <span key={t} className="chip">{t}</span>)}</div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="section">
        <div className="container split">
          <Reveal>
            <SmartImage src={IMAGES.about} alt="People collaborating around a table" style={{ borderRadius: "var(--radius-lg)", aspectRatio: "4 / 3", boxShadow: "var(--shadow)" }} />
          </Reveal>
          <Reveal delay={1}>
            <span className="eyebrow">About us</span>
            <h2>A space where every voice is heard</h2>
            <div className="divider" />
            <p className="text-muted">
              Balanced Minds Consultancy began with a simple mission: to create a place where every struggle is acknowledged and every person feels supported. What started as a small step to bridge the gap between mental health and real-life challenges has grown into a sanctuary of healing and growth.
            </p>
            <p className="text-muted">
              We believe healing begins with trust. That's why we prioritise open dialogue, compassionate care and breaking the stigma around mental wellness - helping people believe in themselves, in recovery and in brighter days, one step at a time.
            </p>
            <Link to="/about" className="btn btn--outline">Learn more about us</Link>
          </Reveal>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section section--alt">
        <div className="container">
          <SectionHead eyebrow="What we offer" title="Our services">
            Personalised support across mental wellness, careers and personal growth.
          </SectionHead>
          <div className="grid grid--3">
            {SERVICES.map((s, i) => (
              <Reveal key={s.slug} delay={(i % 3) + 1}>
                <Link to={`/services/${s.slug}`} className="card card--hover service-card">
                  <span className="card__icon"><ServiceIcon name={s.icon} /></span>
                  <h3>{s.title}</h3>
                  <p>{s.summary}</p>
                  <span className="service-card__more">Learn more <FiArrowRight aria-hidden="true" /></span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* BANNER */}
      <section className="banner">
        <SmartImage className="banner__bg" src={IMAGES.banner} alt="" style={{ position: "absolute", inset: 0 }} />
        <div className="container">
          <Reveal>
            <h2>Expert services and guidance for personal, professional and emotional growth</h2>
            <Link to="/contact" className="btn btn--accent btn--lg">Connect with us</Link>
          </Reveal>
        </div>
      </section>

      {/* WHY */}
      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Why choose us" title="Care you can trust" />
          <div className="grid grid--4">
            {WHY.map((w, i) => (
              <Reveal key={w.title} delay={(i % 4) + 0}>
                <div className="card why-card" style={{ height: "100%" }}>
                  <span className="card__icon"><w.icon aria-hidden="true" /></span>
                  <h3 style={{ fontSize: "var(--fs-lg)" }}>{w.title}</h3>
                  <p>{w.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* WELLNESS CHECK */}
      <section className="section section--alt">
        <div className="container split">
          <Reveal>
            <span className="eyebrow">Self check-in</span>
            <h2>Not sure where to start?</h2>
            <div className="divider" />
            <p className="text-muted">
              A short, private check-in can help you notice how stress is showing up in your life. It takes about two minutes, and you can talk through your results with one of our experts.
            </p>
          </Reveal>
          <Reveal delay={1}><WellnessCheck /></Reveal>
        </div>
      </section>

      {/* TEAM */}
      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Our people" title="Meet our team">
            Passionate professionals dedicated to delivering thoughtful, effective care.
          </SectionHead>
          <div className="grid grid--4">
            {TEAM.map((m, i) => (
              <Reveal key={m.name} delay={(i % 4)}>
                <article className="card card--hover team-card">
                  <div className="team-card__head">
                    <Avatar name={m.name} size={52} />
                    <div><h3>{m.name}</h3><p>{m.role}</p></div>
                  </div>
                  <ul>{m.points.map((p) => <li key={p}>{p}</li>)}</ul>
                </article>
              </Reveal>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link to="/experts" className="btn btn--primary">See all experts <FiArrowRight aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section section--alt">
        <div className="container split">
          <Reveal className="faq__media">
            <SmartImage src={IMAGES.faq} alt="A person reflecting by a window" style={{ height: "100%" }} />
          </Reveal>
          <div>
            <Reveal>
              <span className="eyebrow">FAQ</span>
              <h2>Questions, answered</h2>
              <div className="divider" />
            </Reveal>
            <Accordion items={FAQS} />
          </div>
        </div>
      </section>

      <ClientFeedback />

      {/* CTA */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal className="cta-band">
            <div>
              <h2>Ready to take the first step?</h2>
              <p>Book a confidential session with an expert who understands.</p>
            </div>
            <Link to="/experts" className="btn btn--accent btn--lg">Book a session</Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
