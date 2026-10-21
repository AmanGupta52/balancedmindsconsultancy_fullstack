import { Outlet } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import { FiPhoneCall } from "react-icons/fi";
import { SITE } from "../../config/site";
import Header from "./Header";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";

export default function Layout() {
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <ScrollToTop />
      <Header />
      <main id="main" tabIndex={-1} style={{ outline: "none" }}>
        <Outlet />
      </main>
      <Footer />
      <div className="float-actions">
        <a className="wa" href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
          <FaWhatsapp />
        </a>
        <a className="call" href={`tel:${SITE.phone.replace(/\s/g, "")}`} aria-label="Call us">
          <FiPhoneCall />
        </a>
      </div>
    </>
  );
}
