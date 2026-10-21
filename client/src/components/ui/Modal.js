import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";

/** Accessible modal: Esc / backdrop click closes, focus moves inside, page scroll is locked. */
export default function Modal({ title, onClose, children, size = "md", labelledBy = "modal-title" }) {
  const dialogRef = useRef(null);
  // Parents usually pass a new onClose function on every render. Reading it through a ref keeps
  // the effect below from re-running (and re-focusing the dialog) each time you type a letter.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    document.body.classList.add("no-scroll");
    dialogRef.current?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") onCloseRef.current();
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("no-scroll");
      previouslyFocused?.focus?.();
    };
  }, []);

  return createPortal(
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        className={`modal ${size === "lg" ? "modal--lg" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
      >
        <button type="button" className="icon-btn modal__close" aria-label="Close dialog" onClick={onClose}>
          <FiX />
        </button>
        {title && (
          <h2 id={labelledBy} className="modal__title">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}
