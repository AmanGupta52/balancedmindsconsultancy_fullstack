import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

export default function Accordion({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="accordion">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className={`accordion__item ${isOpen ? "is-open" : ""}`}>
            <h3 className="mb-0" style={{ fontFamily: "var(--font-body)", fontSize: "inherit" }}>
              <button
                type="button"
                className="accordion__btn"
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                id={`faq-btn-${i}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                {item.q}
                <FiChevronDown aria-hidden="true" />
              </button>
            </h3>
            <div className="accordion__panel" id={`faq-panel-${i}`} role="region" aria-labelledby={`faq-btn-${i}`}>
              <div>
                <p>{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
