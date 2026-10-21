import { Link, Navigate, useParams } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { SERVICES, getServiceBySlug } from "../data/services";
import { IMAGES } from "../data/images";
import PageHero from "../components/ui/PageHero";
import SmartImage from "../components/ui/SmartImage";
import ServiceIcon from "../components/ui/ServiceIcon";
import ContactForm from "../components/ui/ContactForm";

export default function ServiceDetailPage() {
  const { slug } = useParams();
  const service = getServiceBySlug(slug);
  useDocumentTitle(service?.title);

  if (!service) return <Navigate to="/services" replace />;

  return (
    <>
      <PageHero title={service.fullTitle} subtitle={service.summary} crumbs={[{ label: "Services", to: "/services" }, { label: service.title }]} />

      <section className="section">
        <div className="container service-layout">
          <article>
            <SmartImage
              className="service-layout__hero"
              src={IMAGES[service.image]}
              alt={`${service.title} session`}
              icon={() => <ServiceIcon name={service.icon} />}
              eager
            />
            <div className="prose">
              {service.body.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
            <div className="cta-band" style={{ marginTop: "var(--sp-6)" }}>
              <div>
                <h2 style={{ fontSize: "var(--fs-xl)" }}>Interested in {service.title.toLowerCase()}?</h2>
                <p>Speak with an expert and find the approach that fits you.</p>
              </div>
              <Link to="/experts" className="btn btn--accent">Book a session <FiArrowRight aria-hidden="true" /></Link>
            </div>
          </article>

          <aside className="sticky-col" aria-label="Related">
            <div className="card">
              <h3 style={{ fontSize: "var(--fs-lg)" }}>Our solutions</h3>
              <nav className="side-nav" aria-label="Services">
                {SERVICES.map((s) => (
                  <Link key={s.slug} to={`/services/${s.slug}`} className={s.slug === slug ? "is-active" : ""} aria-current={s.slug === slug ? "page" : undefined}>
                    {s.title}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="card">
              <h3 style={{ fontSize: "var(--fs-lg)" }}>Ask us anything</h3>
              <ContactForm compact defaultService={service.title} />
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
