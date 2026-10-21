import { useEffect, useState } from "react";
import api from "../../api/client";
import SectionHead from "../ui/SectionHead";
import Stars from "../ui/Stars";
import Avatar from "../ui/Avatar";
import Reveal from "../ui/Reveal";
import FeedbackForm from "./FeedbackForm";

export default function ClientFeedback() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api
      .get("/feedback")
      .then(({ data }) => setItems(data))
      .catch(() => setItems([]));
  }, []);

  return (
    <section className="section">
      <div className="container">
        <SectionHead eyebrow="Testimonials" title="What our clients say">
          Real experiences from people who trusted us with their journey.
        </SectionHead>

        <div className="grid grid--3">
          {items.slice(0, 5).map((f, i) => (
            <Reveal key={f._id} delay={(i % 3) + 1}>
              <article className="card review-card">
                <div className="review-card__head">
                  <Avatar name={f.fullName} size={44} />
                  <div>
                    <strong>{f.fullName || "Anonymous"}</strong>
                    <Stars value={f.stars} />
                  </div>
                </div>
                <h4 className="mb-0">{f.title}</h4>
                <p>{f.message}</p>
              </article>
            </Reveal>
          ))}
          <Reveal delay={items.length ? 2 : 0}>
            <FeedbackForm onAdded={(f) => setItems((prev) => [f, ...prev])} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
