import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import api, { getErrorMessage } from "../api/client";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { Loading, ErrorState } from "../components/ui/Feedback";

// Supports new links (?booking=ID) and old ones (?room=meeting-ID)
const getBookingId = (params) => params.get("booking") || (params.get("room") || "").replace(/^meeting-/, "");

export default function VideoCallPage() {
  useDocumentTitle("Video session");
  const [params] = useSearchParams();
  const bookingId = getBookingId(params);
  const containerRef = useRef(null);
  const [status, setStatus] = useState(bookingId ? "loading" : "invalid");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId) return undefined;
    let zp;
    let cancelled = false;

    (async () => {
      try {
        const { data } = await api.post("/video/token", { bookingId });
        // Loaded on demand: the Zego SDK is large and only needed on this page.
        const { ZegoUIKitPrebuilt } = await import("@zegocloud/zego-uikit-prebuilt");
        if (cancelled || !containerRef.current) return;

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(data.appId, data.token, data.roomId, data.userId, data.userName);
        zp = ZegoUIKitPrebuilt.create(kitToken);
        zp.joinRoom({
          container: containerRef.current,
          maxUsers: 2,
          scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
          showPreJoinView: true,
        });
        setStatus("ready");
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, "Could not start the video session"));
          setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
      try { zp?.destroy(); } catch { /* already closed */ }
    };
  }, [bookingId]);

  return (
    <div className="video-page">
      <div className="video-page__bar">
        <Link to="/"><FiArrowLeft /> Leave &amp; go home</Link>
        <strong>Secure video session</strong>
      </div>
      <div className="video-page__stage">
        {status === "invalid" && <ErrorState message="This meeting link is invalid." />}
        {status === "error" && <ErrorState message={error} />}
        {status === "loading" && <Loading label="Preparing your session..." />}
        <div ref={containerRef} style={{ width: "100%", height: "100%", display: status === "ready" ? "block" : "none" }} />
      </div>
    </div>
  );
}
