import { Link } from "react-router-dom";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function NotFoundPage() {
  useDocumentTitle("Page not found");
  return (
    <section className="container not-found">
      <p className="not-found__code">404</p>
      <h1>This page can't be found</h1>
      <p className="text-muted">The link may be broken or the page may have moved.</p>
      <div className="row row--center">
        <Link to="/" className="btn btn--primary">Back to home</Link>
        <Link to="/contact" className="btn btn--outline">Contact us</Link>
      </div>
    </section>
  );
}
