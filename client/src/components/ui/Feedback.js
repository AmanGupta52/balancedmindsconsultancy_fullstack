import { FiInbox, FiAlertCircle } from "react-icons/fi";

export function Loading({ label = "Loading..." }) {
  return (
    <div className="center-state" role="status">
      <span className="spinner spinner--lg" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ icon: Icon = FiInbox, title, children }) {
  return (
    <div className="center-state">
      <Icon className="center-state__icon" />
      <h3 className="mb-0">{title}</h3>
      {children && <p className="mb-0">{children}</p>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="center-state" role="alert">
      <FiAlertCircle className="center-state__icon" style={{ color: "var(--danger)" }} />
      <p className="mb-0">{message}</p>
      {onRetry && (
        <button type="button" className="btn btn--outline btn--sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
