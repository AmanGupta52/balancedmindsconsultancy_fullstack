import Reveal from "./Reveal";

export default function SectionHead({ eyebrow, title, children }) {
  return (
    <Reveal className="section-head">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      <div className="divider" />
      {children && <p>{children}</p>}
    </Reveal>
  );
}
