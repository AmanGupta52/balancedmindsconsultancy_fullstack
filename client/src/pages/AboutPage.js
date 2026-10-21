import { Link } from "react-router-dom";
import { FiTarget, FiEye, FiCheckCircle } from "react-icons/fi";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { TEAM } from "../data/team";
import { IMAGES } from "../data/images";
import PageHero from "../components/ui/PageHero";
import SmartImage from "../components/ui/SmartImage";
import SectionHead from "../components/ui/SectionHead";
import Avatar from "../components/ui/Avatar";
import Reveal from "../components/ui/Reveal";

const REASONS = [
  "Trusted by professionals and families",
  "Experienced, qualified counsellors",
  "Custom plans for every client",
  "Affordable, transparent pricing",
  "Confidential and safe environment",
];

export default function AboutPage() {
  useDocumentTitle("About us");
  return (
    <>
      <PageHero title="About us" subtitle="High-quality care with an honest approach." crumbs={[{ label: "About" }]} />

      <section className="section">
        <div className="container split">
          <Reveal>
            <SmartImage src={IMAGES.about} alt="Our team collaborating" style={{ borderRadius: "var(--radius-lg)", aspectRatio: "4 / 3", boxShadow: "var(--shadow)" }} />
          </Reveal>
          <Reveal delay={1}>
            <span className="eyebrow">Who we are</span>
            <h2>Professional mental health and wellness services</h2>
            <div className="divider" />
            <p className="text-muted">
              Balanced Minds Consultancy offers professional mental health and wellness services designed to help you lead a more balanced, healthier life. We are dedicated to providing customised care tailored to your needs.
            </p>
            <p className="text-muted">
              We are a team of experienced counsellors, therapists and mental health professionals committed to guiding you through emotional, behavioural and psychological challenges.
            </p>
            <Link to="/experts" className="btn btn--primary">Meet our experts</Link>
          </Reveal>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container grid grid--2">
          <Reveal className="card">
            <span className="card__icon"><FiEye /></span>
            <h3>Our vision</h3>
            <p className="text-muted mb-0">To empower individuals and families to achieve mental clarity, emotional resilience and a balanced life.</p>
          </Reveal>
          <Reveal className="card" delay={1}>
            <span className="card__icon"><FiTarget /></span>
            <h3>Our mission</h3>
            <p className="text-muted mb-0">To provide accessible, ethical and evidence-based support for everyone - breaking the stigma around mental wellness.</p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container split split--reverse">
          <Reveal delay={1}>
            <SmartImage src={IMAGES.team} alt="Experts in discussion" style={{ borderRadius: "var(--radius-lg)", aspectRatio: "4 / 3", boxShadow: "var(--shadow)" }} />
          </Reveal>
          <Reveal>
            <span className="eyebrow">Why choose us</span>
            <h2>Our commitment and expertise</h2>
            <div className="divider" />
            <ul className="stack">
              {REASONS.map((r) => (
                <li key={r} className="row" style={{ flexWrap: "nowrap", alignItems: "flex-start" }}>
                  <FiCheckCircle style={{ color: "var(--brand-600)", marginTop: 5, flex: "none" }} aria-hidden="true" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <SectionHead eyebrow="Our people" title="Meet our team" />
          <div className="grid grid--4">
            {TEAM.map((m, i) => (
              <Reveal key={m.name} delay={i % 4}>
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
        </div>
      </section>
    </>
  );
}
