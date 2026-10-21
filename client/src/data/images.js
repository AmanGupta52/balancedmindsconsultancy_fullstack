// Photos are loaded from Unsplash (free to use, hosted on a reliable CDN).
// Every <SmartImage> falls back to a branded gradient if a URL ever fails,
// so a removed photo can never leave a broken-image icon on the site.
const u = (id, w = 1200) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const IMAGES = {
  hero: u("1506126613408-eca07ce68773", 1400),
  about: u("1522202176988-66273c2fd55f"),
  team: u("1517048676732-d65bc937f952"),
  contact: u("1556761175-5973dc0f32e7"),
  faq: u("1499209974431-9dddcece7f88"),
  banner: u("1470071459604-3b5ec3a7fe05", 1600),
  talks: u("1475721027785-f74eccf877e2"),
  counselling: u("1573497019940-1c28c88b4f3e"),
  career: u("1521737604893-d14cc237f11d"),
  coaching: u("1552664730-d307ca884978"),
  skills: u("1531545514256-b1400bc00f31"),
  image: u("1483985988355-763728e1935b"),
  abroad: u("1436491865332-7a61a109cc05"),
  graphology: u("1517842645767-c639042777db"),
  reiki: u("1544367567-0f2fcb009e0b"),
};
