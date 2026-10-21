import useReveal from "../../hooks/useReveal";

/** Fades/slides children in when scrolled into view. delay: 0-3 */
export default function Reveal({ as: Tag = "div", delay = 0, className = "", children, ...rest }) {
  const ref = useReveal();
  return (
    <Tag ref={ref} className={`reveal ${className}`} data-delay={delay || undefined} {...rest}>
      {children}
    </Tag>
  );
}
