import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { SERVICES } from "../data/services";
import PageHero from "../components/ui/PageHero";
import ServiceIcon from "../components/ui/ServiceIcon";
import Reveal from "../components/ui/Reveal";
import SectionHead from "../components/ui/SectionHead";
import ContactForm from "../components/ui/ContactForm";
import ClientFeedback from "../components/feedback/ClientFeedback";

export default function ServicesPage() {
  useDocumentTitle("Services");
  return (
    <>
      <PageHero title="Our services" subtitle="Expert solutions and personalised support to drive growth - emotional, professional and personal." crumbs={[{ label: "Services" }]} />

      <section className="section">
        <div className="container grid grid--3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.slug} delay={(i % 3) + 1}>
              <Link to={`/services/${s.slug}`} className="card card--hover service-card">
                <span className="card__icon"><ServiceIcon name={s.icon} /></span>
                <h3>{s.title}</h3>
                <p>{s.summary}</p>
                <span className="service-card__more">Read more <FiArrowRight aria-hidden="true" /></span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <ClientFeedback />

      <section className="section section--alt">
        <div className="container" style={{ maxWidth: 720 }}>
          <SectionHead eyebrow="Get started" title="Book your consultation">
            Tell us a little about what you need and we'll recommend the right expert.
          </SectionHead>
          <div className="card"><ContactForm /></div>
        </div>
      </section>
    </>
  );
}
