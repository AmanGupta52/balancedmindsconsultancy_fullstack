import { FiMapPin, FiPhone, FiMail, FiClock } from "react-icons/fi";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { SITE } from "../config/site";
import PageHero from "../components/ui/PageHero";
import ContactForm from "../components/ui/ContactForm";
import Reveal from "../components/ui/Reveal";
import LocationMap from "../components/map/LocationMap";

export default function ContactPage() {
  useDocumentTitle("Contact");
  const tel = SITE.phone.replace(/\s/g, "");
  return (
    <>
      <PageHero title="Contact us" subtitle="Get in touch for quick assistance and personalised support. We're here to help." crumbs={[{ label: "Contact" }]} />

      <section className="section">
        <div className="container contact-grid">
          <Reveal className="stack">
            <div className="card stack">
              <div className="info-item">
                <span className="card__icon"><FiMapPin /></span>
                <div><h4>Office</h4><p>{SITE.address.join(" ")}</p></div>
              </div>
              <div className="info-item">
                <span className="card__icon"><FiPhone /></span>
                <div><h4>Phone</h4><p><a href={`tel:${tel}`}>{SITE.phone}</a></p></div>
              </div>
              <div className="info-item">
                <span className="card__icon"><FiMail /></span>
                <div><h4>Email</h4><p><a href={`mailto:${SITE.email}`}>{SITE.email}</a></p></div>
              </div>
              <div className="info-item">
                <span className="card__icon"><FiClock /></span>
                <div><h4>Hours</h4><p>{SITE.hours}</p></div>
              </div>
            </div>
            <LocationMap />
          </Reveal>

          <Reveal delay={1}>
            <div className="card">
              <h2 style={{ fontSize: "var(--fs-xl)" }}>Send us a message</h2>
              <p className="text-muted">Fill in the form and we'll get back to you shortly.</p>
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
