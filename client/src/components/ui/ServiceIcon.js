import { FiMic, FiMessageCircle, FiCompass, FiTarget, FiUsers, FiStar, FiGlobe, FiEdit3, FiSun, FiHeart } from "react-icons/fi";

const ICONS = { FiMic, FiMessageCircle, FiCompass, FiTarget, FiUsers, FiStar, FiGlobe, FiEdit3, FiSun, FiHeart };

export default function ServiceIcon({ name, ...props }) {
  const Icon = ICONS[name] || FiHeart;
  return <Icon aria-hidden="true" {...props} />;
}
