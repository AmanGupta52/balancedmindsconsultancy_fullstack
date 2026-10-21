import useDocumentTitle from "../hooks/useDocumentTitle";
import { SITE } from "../config/site";
import PageHero from "../components/ui/PageHero";

export function PrivacyPage() {
  useDocumentTitle("Privacy policy");
  return (
    <>
      <PageHero title="Privacy policy" crumbs={[{ label: "Privacy" }]} />
      <section className="section"><div className="container legal">
        <p>This policy explains how {SITE.name} handles your information. It is a starting template - please have it reviewed before relying on it.</p>
        <h2>What we collect</h2>
        <ul>
          <li>Account details you provide: name, age, email address and password (stored only as a secure hash).</li>
          <li>Booking details: phone number, preferred time and the concern you describe.</li>
          <li>Messages you send through the contact form and any feedback you submit.</li>
        </ul>
        <h2>How we use it</h2>
        <p>We use your information to run your account, arrange and conduct sessions, send verification codes and respond to your enquiries. Session details are shared only with the expert you book.</p>
        <h2>Payments</h2>
        <p>Online payments are processed by Razorpay; we never see or store your card details.</p>
        <h2>Your choices</h2>
        <p>You can update your name and age from your profile. To delete your account or data, contact us at <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
      </div></section>
    </>
  );
}

export function TermsPage() {
  useDocumentTitle("Terms of use");
  return (
    <>
      <PageHero title="Terms of use" crumbs={[{ label: "Terms" }]} />
      <section className="section"><div className="container legal">
        <p>By using this website you agree to these terms. This is a starting template - please have it reviewed before relying on it.</p>
        <h2>Our services</h2>
        <p>{SITE.name} provides counselling, coaching and wellness guidance. Our services are not a substitute for emergency or hospital care. In a crisis, call your local emergency number; in India you can reach Tele-MANAS on 14416.</p>
        <h2>Bookings and payments</h2>
        <p>A booking is a request until the expert confirms it. Fees are shown before you pay. Refunds and rescheduling are handled case by case - please contact us.</p>
        <h2>Your account</h2>
        <p>Keep your login details private and provide accurate information. You are responsible for activity on your account.</p>
        <h2>Contact</h2>
        <p>Questions? Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
      </div></section>
    </>
  );
}
