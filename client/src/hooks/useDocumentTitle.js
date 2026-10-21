import { useEffect } from "react";
import { SITE } from "../config/site";

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE.shortName}` : SITE.name;
  }, [title]);
}
