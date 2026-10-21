import { useMemo, useState } from "react";
import { FiSearch, FiClock, FiGlobe, FiVideo, FiMapPin } from "react-icons/fi";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useFetch from "../hooks/useFetch";
import { expertPhotoUrl } from "../api/client";
import { PROVIDER } from "../config/site";
import { useAuth } from "../context/AuthContext";
import { useAuthModal } from "../context/AuthModalContext";
import { useToast } from "../context/ToastContext";
import { formatCurrency } from "../utils/format";
import PageHero from "../components/ui/PageHero";
import Avatar from "../components/ui/Avatar";
import Reveal from "../components/ui/Reveal";
import { EmptyState, ErrorState } from "../components/ui/Feedback";
import BookingModal from "../components/booking/BookingModal";
import ClientFeedback from "../components/feedback/ClientFeedback";

const unique = (lists) => [...new Set(lists.flat().filter(Boolean))].sort();

export default function ExpertsPage() {
  useDocumentTitle(`Our ${PROVIDER.plural.toLowerCase()}`);
  const { user, isCustomer } = useAuth();
  const { openAuth } = useAuthModal();
  const toast = useToast();
  const { data, loading, error, reload } = useFetch("/experts");
  const experts = data || [];

  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [selected, setSelected] = useState(null);

  const languages = useMemo(() => unique(experts.map((e) => e.languages || [])), [experts]);
  const specialities = useMemo(() => unique(experts.map((e) => e.specialities || [])), [experts]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return experts.filter((e) => {
      const text = `${e.fullName} ${e.title || ""} ${(e.specialities || []).join(" ")}`.toLowerCase();
      return (
        (!term || text.includes(term)) &&
        (!language || e.languages?.includes(language)) &&
        (!speciality || e.specialities?.includes(speciality))
      );
    });
  }, [experts, search, language, speciality]);

  const startBooking = (expert) => {
    if (!user) return openAuth("login", () => setSelected(expert));
    if (!isCustomer) return toast.info("Please use a customer account to book a session.");
    setSelected(expert);
  };

  const reset = () => { setSearch(""); setLanguage(""); setSpeciality(""); };
  const hasFilters = search || language || speciality;

  return (
    <>
      <PageHero title={`Find a ${PROVIDER.singular.toLowerCase()} who understands you`} subtitle="Browse our counsellors, therapists and coaches and book a session that suits you." crumbs={[{ label: PROVIDER.plural }]} />

      <section className="section">
        <div className="container">
          <div className="filters" role="search">
            <div className="search">
              <FiSearch aria-hidden="true" />
              <input className="input" type="search" placeholder="Search by name, title or speciality" aria-label={`Search ${PROVIDER.plural.toLowerCase()}`} value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="select" aria-label="Filter by language" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="">All languages</option>
              {languages.map((l) => <option key={l}>{l}</option>)}
            </select>
            <select className="select" aria-label="Filter by speciality" value={speciality} onChange={(e) => setSpeciality(e.target.value)}>
              <option value="">All specialities</option>
              {specialities.map((s) => <option key={s}>{s}</option>)}
            </select>
            <button type="button" className="btn btn--ghost" onClick={reset} disabled={!hasFilters}>Reset</button>
          </div>

          {loading ? (
            <div className="grid grid--3" aria-busy="true">
              {[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 320, borderRadius: "var(--radius)" }} />)}
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : filtered.length === 0 ? (
            <EmptyState title={`No ${PROVIDER.plural.toLowerCase()} found`}>{hasFilters ? "Try changing or clearing your filters." : `Our ${PROVIDER.plural.toLowerCase()} will appear here soon.`}</EmptyState>
          ) : (
            <div className="grid grid--3">
              {filtered.map((e, i) => (
                <Reveal key={e._id} delay={i % 3}>
                  <article className="card card--hover expert-card">
                    <div className="expert-card__head">
                      <Avatar name={e.fullName} src={e.hasPhoto ? expertPhotoUrl(e._id) : null} size={76} />
                      <div>
                        <h3>{e.fullName}</h3>
                        <p className="expert-card__title">{e.title || "Expert"}</p>
                        {e.experience && <span className="badge badge--accent" style={{ marginTop: 6 }}>{e.experience}</span>}
                      </div>
                    </div>

                    {e.specialities?.length > 0 && (
                      <div className="chip-row">{e.specialities.map((s) => <span key={s} className="badge">{s}</span>)}</div>
                    )}

                    <dl className="expert-card__meta">
                      {e.languages?.length > 0 && <div><FiGlobe aria-hidden="true" style={{ verticalAlign: "-2px" }} /> <dt>Speaks: </dt><dd>{e.languages.join(", ")}</dd></div>}
                      <div>
                        {e.availability === "In-person" ? <FiMapPin aria-hidden="true" style={{ verticalAlign: "-2px" }} /> : <FiVideo aria-hidden="true" style={{ verticalAlign: "-2px" }} />}{" "}
                        <dt>Mode: </dt><dd>{e.availability === "Both" ? "Online & in-person" : e.availability || "Online"}</dd>
                      </div>
                      <div><FiClock aria-hidden="true" style={{ verticalAlign: "-2px" }} /> <dt>Available: </dt><dd>{e.time || "Flexible"}</dd></div>
                    </dl>

                    <div className="expert-card__foot">
                      <div className="price">{formatCurrency(e.fee)} <small>/ session</small></div>
                      <button type="button" className="btn btn--primary" onClick={() => startBooking(e)}>Book</button>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <ClientFeedback />
      {selected && <BookingModal expert={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
