import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa";

const MAP = { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube };

export default function SocialIcon({ name }) {
  const Icon = MAP[name];
  return Icon ? <Icon aria-hidden="true" /> : null;
}
