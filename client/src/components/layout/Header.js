import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { FiMail, FiPhone, FiMenu, FiX, FiChevronDown, FiBell, FiUser, FiLogOut, FiGrid, FiShield } from "react-icons/fi";
import { SITE } from "../../config/site";
import { SERVICES } from "../../data/services";
import { useAuth } from "../../context/AuthContext";
import { useAuthModal } from "../../context/AuthModalContext";
import { useToast } from "../../context/ToastContext";
import api from "../../api/client";
import { bookingStart } from "../../utils/format";
import Avatar from "../ui/Avatar";
import NotificationsPanel from "../notifications/NotificationsPanel";
import SocialIcon from "./SocialIcon";

const NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/experts", label: "Experts" },
  { to: "/news", label: "News" },
  { to: "/contact", label: "Contact" },
];

const REMINDER_WINDOW_MIN = 10;

export default function Header() {
  const { user, logout, isAdmin, isModerator, isCustomer } = useAuth();
  const { openAuth } = useAuthModal();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const reminded = useRef(new Set());
  const headerRef = useRef(null);

  // close menus on navigation
  useEffect(() => {
    setMenuOpen(false);
    setServicesOpen(false);
    setUserOpen(false);
  }, [location.pathname]);

  // close dropdowns on outside click / Escape
  useEffect(() => {
    const onClick = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setServicesOpen(false);
        setUserOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setServicesOpen(false);
        setUserOpen(false);
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // sign-in dialog requested by a redirect (e.g. protected page)
  useEffect(() => {
    if (location.state?.needsLogin && !user) {
      openAuth("login");
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, user, openAuth, navigate]);

  const loadBookings = useCallback(async () => {
    if (!isCustomer) return;
    setBookingsLoading(true);
    try {
      const { data } = await api.get("/bookings/mine");
      setBookings(data);
    } catch {
      /* the bell simply stays empty if this fails */
    } finally {
      setBookingsLoading(false);
    }
  }, [isCustomer]);

  useEffect(() => {
    if (isCustomer) loadBookings();
    else setBookings([]);
  }, [isCustomer, loadBookings]);

  // In-app reminder shortly before an accepted session starts
  useEffect(() => {
    if (!bookings.length) return undefined;
    const check = () => {
      const now = Date.now();
      bookings.forEach((b) => {
        if (b.status !== "accepted" || reminded.current.has(b._id)) return;
        const start = bookingStart(b);
        if (!start) return;
        const minutes = (start.getTime() - now) / 60000;
        if (minutes >= -5 && minutes <= REMINDER_WINDOW_MIN) {
          reminded.current.add(b._id);
          toast.info(`Your session with ${b.expertName} starts soon. Open notifications to join.`);
        }
      });
    };
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, [bookings, toast]);

  const upcomingCount = bookings.filter((b) => ["pending", "accepted"].includes(b.status)).length;

  const handleLogout = () => {
    logout();
    setUserOpen(false);
    navigate("/");
  };

  const dashboard = isAdmin
    ? { to: "/admin-dashboard", label: "Admin dashboard", icon: <FiShield /> }
    : isModerator
    ? { to: "/moderator-dashboard", label: "Expert dashboard", icon: <FiGrid /> }
    : null;

  return (
    <>
      <div className="topbar">
        <div className="container topbar__inner">
          <div className="topbar__links">
            <a href={`mailto:${SITE.email}`}><FiMail aria-hidden="true" /> {SITE.email}</a>
            <a href={`tel:${SITE.phone.replace(/\s/g, "")}`}><FiPhone aria-hidden="true" /> {SITE.phone}</a>
          </div>
          <div className="topbar__social">
            {SITE.social.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                <SocialIcon name={s.icon} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <header ref={headerRef} className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="container nav">
          <Link to="/" className="brand" aria-label={`${SITE.name} home`}>
            <img src="/logo.svg" alt="" width="44" height="44" />
            <span className="brand__text">
              <span className="brand__name">{SITE.name}</span>
              <span className="brand__tag">{SITE.tagline.split(",")[0]}</span>
            </span>
          </Link>

          <div className="nav__tools" style={{ order: 2 }}>
            {isCustomer && (
              <button type="button" className="icon-btn" aria-label={`Notifications${upcomingCount ? `, ${upcomingCount} upcoming` : ""}`} onClick={() => setNotifOpen(true)}>
                <FiBell />
                {upcomingCount > 0 && <span className="badge-dot">{upcomingCount}</span>}
              </button>
            )}
            <button
              type="button"
              className="icon-btn nav__toggle"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="primary-nav"
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>

          <div id="primary-nav" className={`nav__menu ${menuOpen ? "is-open" : ""}`}>
            <nav aria-label="Primary" className="nav__links" style={{ listStyle: "none" }}>
              {NAV.slice(0, 2).map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `nav__link ${isActive ? "is-active" : ""}`}>
                  {item.label}
                </NavLink>
              ))}

              <div className={`nav__dropdown ${servicesOpen ? "is-open" : ""}`}>
                <button type="button" className="nav__dropdown-btn" aria-expanded={servicesOpen} aria-haspopup="true" onClick={() => setServicesOpen((o) => !o)}>
                  Services <FiChevronDown aria-hidden="true" />
                </button>
                <div className="nav__dropdown-menu">
                  {SERVICES.map((s) => (
                    <Link key={s.slug} to={`/services/${s.slug}`}>{s.title}</Link>
                  ))}
                  <Link to="/services" style={{ fontWeight: 600, color: "var(--brand-700)" }}>View all services</Link>
                </div>
              </div>

              {NAV.slice(2).map((item) => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav__link ${isActive ? "is-active" : ""}`}>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="nav__actions">
              <Link to="/experts" className="btn btn--accent">Book a session</Link>

              {!user ? (
                <button type="button" className="btn btn--outline" onClick={() => openAuth("login")}>
                  <FiUser aria-hidden="true" /> Sign in
                </button>
              ) : (
                <div className="user-menu">
                  <button type="button" className="user-menu__btn" aria-expanded={userOpen} aria-haspopup="true" onClick={() => setUserOpen((o) => !o)}>
                    <Avatar name={user.fullName} size={34} />
                    <span className="name">{user.fullName?.split(" ")[0] || "Account"}</span>
                    <FiChevronDown aria-hidden="true" />
                  </button>
                  {userOpen && (
                    <div className="user-menu__list" role="menu">
                      <div className="meta"><strong style={{ color: "var(--ink)" }}>{user.fullName}</strong><br />{user.email}</div>
                      {isCustomer && <Link to="/profile" role="menuitem"><FiUser /> My profile &amp; bookings</Link>}
                      {dashboard && <Link to={dashboard.to} role="menuitem">{dashboard.icon} {dashboard.label}</Link>}
                      <button type="button" className="danger" role="menuitem" onClick={handleLogout}><FiLogOut /> Sign out</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {notifOpen && <NotificationsPanel bookings={bookings} loading={bookingsLoading} onReload={loadBookings} onClose={() => setNotifOpen(false)} />}
    </>
  );
}
