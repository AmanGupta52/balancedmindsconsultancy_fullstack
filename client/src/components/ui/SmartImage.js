import { useState } from "react";
import { FiImage } from "react-icons/fi";

/**
 * <img> with lazy loading, a fade-in, and a branded gradient fallback if the
 * image fails to load. The parent controls size/shape (give it a height or aspect-ratio).
 */
export default function SmartImage({ src, alt = "", className = "", style, eager = false, icon: Icon = FiImage, ...rest }) {
  const [state, setState] = useState(src ? "loading" : "error");
  return (
    <div className={`smart-img ${className}`} style={style}>
      {state !== "loaded" && (
        <div className="smart-img__fallback" aria-hidden="true">
          {state === "error" && <Icon />}
        </div>
      )}
      {src && state !== "error" && (
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setState("loaded")}
          onError={() => setState("error")}
          className={state === "loaded" ? "is-loaded" : ""}
          {...rest}
        />
      )}
    </div>
  );
}
