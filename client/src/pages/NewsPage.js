import { useEffect, useState, useCallback } from "react";
import { FiSearch, FiExternalLink, FiFileText } from "react-icons/fi";
import useDocumentTitle from "../hooks/useDocumentTitle";
import api, { getErrorMessage } from "../api/client";
import { formatDate } from "../utils/format";
import PageHero from "../components/ui/PageHero";
import SmartImage from "../components/ui/SmartImage";
import { EmptyState, ErrorState } from "../components/ui/Feedback";

export default function NewsPage() {
  useDocumentTitle("Wellness news");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const load = useCallback(async (q = "") => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/news", { params: q ? { q } : {} });
      setArticles(data.articles || []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load news"));
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <PageHero title="Wellness & therapy news" subtitle="The latest stories on mental health, wellbeing and personal growth." crumbs={[{ label: "News" }]} />
      <section className="section">
        <div className="container">
          <form className="filters" style={{ gridTemplateColumns: "1fr auto" }} role="search" onSubmit={(e) => { e.preventDefault(); load(query.trim()); }}>
            <div className="search">
              <FiSearch aria-hidden="true" />
              <input className="input" type="search" placeholder="Search wellness topics" aria-label="Search news" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <button className="btn btn--primary">Search</button>
          </form>

          {loading ? (
            <div className="news-grid" aria-busy="true">{[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton" style={{ height: 300, borderRadius: "var(--radius)" }} />)}</div>
          ) : error ? (
            <ErrorState message={error} onRetry={() => load(query.trim())} />
          ) : articles.length === 0 ? (
            <EmptyState title="No articles found">Try a different search term.</EmptyState>
          ) : (
            <div className="news-grid">
              {articles.map((a) => (
                <article key={a.url} className="card card--hover news-card">
                  <SmartImage className="news-card__img" src={a.urlToImage} alt="" icon={FiFileText} />
                  <div className="news-card__body">
                    <h3>{a.title}</h3>
                    <p>{a.description || "No description available."}</p>
                    <div className="news-card__foot">
                      <span>{a.source?.name} · {formatDate(a.publishedAt)}</span>
                      <a href={a.url} target="_blank" rel="noopener noreferrer" aria-label={`Read "${a.title}" (opens in a new tab)`}><FiExternalLink /> Read</a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
