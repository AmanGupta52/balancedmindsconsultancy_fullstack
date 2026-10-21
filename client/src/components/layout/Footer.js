import { Link } from "react-router-dom";
import { FiMail, FiMapPin, FiPhone, FiClock } from "react-icons/fi";
import { SITE, PROVIDER } from "../../config/site";
import { SERVICES } from "../../data/services";
import SocialIcon from "./SocialIcon";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Link to="/" className="brand">
              <img src="/logo.svg" alt="" width="44" height="44" />
              <span className="brand__text">
                <span className="brand__name">{SITE.name}</span>
                <span className="brand__tag">{SITE.tagline}</span>
              </span>
            </Link>
            <p style={{ maxWidth: "36ch" }}>
              Professional counselling, coaching and wellness guidance that helps individuals and families build clarity, resilience and balance.
            </p>
            <div className="footer__social">
              {SITE.social.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                  <SocialIcon name={s.icon} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4>Quick links</h4>
            <ul className="footer__list">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About us</Link></li>
              <li><Link to="/experts">Our {PROVIDER.plural.toLowerCase()}</Link></li>
              <li><Link to="/news">Wellness news</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4>Services</h4>
            <ul className="footer__list">
              {SERVICES.slice(0, 6).map((s) => (
                <li key={s.slug}><Link to={`/services/${s.slug}`}>{s.title}</Link></li>
              ))}
              <li><Link to="/services">All services</Link></li>
            </ul>
          </div>

          <div>
            <h4>Get in touch</h4>
            <ul className="footer__contact footer__list">
              <li><FiMapPin /><span>{SITE.address.join(" ")}</span></li>
              <li><FiPhone /><a href={`tel:${SITE.phone.replace(/\s/g, "")}`}>{SITE.phone}</a></li>
              <li><FiMail /><a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
              <li><FiClock /><span>{SITE.hours}</span></li>
            </ul>
          </div>
        </div>

        <p className="footer__disclaimer">
          If you or someone you know is in immediate danger or crisis, please call your local emergency number. In India you can call Tele-MANAS at 14416 (24x7, free).
        </p>

        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</span>
          <nav aria-label="Legal">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Use</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
