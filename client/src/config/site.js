// Central place for brand + contact details. Override via REACT_APP_* env vars.
export const SITE = {
  name: "Balanced Minds Consultancy",
  shortName: "Balanced Minds",
  tagline: "Empowering minds, one step at a time",
  email: process.env.REACT_APP_CONTACT_EMAIL || "amangupta032005@gmail.com",
  phone: process.env.REACT_APP_CONTACT_PHONE || "+91 90222 51303",
  whatsapp: process.env.REACT_APP_WHATSAPP_NUMBER || "919022251303",
  upiId: process.env.REACT_APP_UPI_ID || "amangupta032005@okaxis",
  address: [
    "Tirupati Bldg No. 60, Ground Floor, 2680 Gandhi Nagar,",
    "Behind Hotel Sai Prasad, Bandra East,",
    "Mumbai 400051, Maharashtra, India",
  ],
  // [latitude, longitude] of the office, used by the contact-page map
  coordinates: [19.05947, 72.849351],
  hours: "Mon - Sat, 10:00 am - 7:00 pm",
  social: [
    { label: "Facebook", href: "https://www.facebook.com/", icon: "FaFacebookF" },
    { label: "Instagram", href: "https://www.instagram.com/", icon: "FaInstagram" },
    { label: "LinkedIn", href: "https://www.linkedin.com/", icon: "FaLinkedinIn" },
    { label: "YouTube", href: "https://www.youtube.com/", icon: "FaYoutube" },
  ],
};

export const API_BASE = (process.env.REACT_APP_API_BASE || "").replace(/\/$/, "");
