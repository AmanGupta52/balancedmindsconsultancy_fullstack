import { useState } from "react";
import { initials } from "../../utils/format";

export default function Avatar({ name, src, size = 56, className = "" }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className={`avatar ${className}`} style={{ "--size": `${size}px` }} aria-hidden="true">
      {src && !failed ? <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} /> : initials(name)}
    </span>
  );
}
