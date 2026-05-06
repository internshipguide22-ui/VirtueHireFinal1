import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogIn, LogOut } from "lucide-react";

const AUTH_KEYS = [
  "candidate",
  "candidateResults",
  "currentUser",
  "user_role",
  "token",
  "current_hr_user",
  "user",
  "admin_logged_in",
  "admin_user",
];

const hasMeaningfulStorageValue = (key) => {
  const value = localStorage.getItem(key);

  if (!value) {
    return false;
  }

  const trimmedValue = value.trim();

  if (
    !trimmedValue ||
    trimmedValue === "null" ||
    trimmedValue === "undefined"
  ) {
    return false;
  }

  if (trimmedValue === "true") {
    return true;
  }

  if (trimmedValue.startsWith("{") || trimmedValue.startsWith("[")) {
    try {
      const parsedValue = JSON.parse(trimmedValue);

      if (Array.isArray(parsedValue)) {
        return parsedValue.length > 0;
      }

      if (parsedValue && typeof parsedValue === "object") {
        return Object.keys(parsedValue).length > 0;
      }

      return Boolean(parsedValue);
    } catch (error) {
      return false;
    }
  }

  return true;
};

const checkAuthSession = () =>
  hasMeaningfulStorageValue("token") ||
  hasMeaningfulStorageValue("candidate") ||
  hasMeaningfulStorageValue("currentUser") ||
  hasMeaningfulStorageValue("current_hr_user") ||
  hasMeaningfulStorageValue("user") ||
  hasMeaningfulStorageValue("admin_user") ||
  hasMeaningfulStorageValue("admin_logged_in");

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(checkAuthSession);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(checkAuthSession());
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    window.addEventListener("auth-change", checkAuth);
    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("auth-change", checkAuth);
    };
  }, [location.pathname]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const goToLanding = () => {
    navigate("/landing");
    closeMenu();
  };

  const handleLogout = () => {
    AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
    setIsLoggedIn(false);
    window.dispatchEvent(new Event("auth-change"));
    navigate("/");
    closeMenu();
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Features", path: "/features" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: "all 0.3s ease",
        background: scrolled ? "var(--glass-bg)" : "transparent",
        backdropFilter: scrolled ? "var(--glass-blur)" : "none",
        boxShadow: scrolled ? "var(--shadow-sm)" : "none",
        borderBottom: scrolled
          ? "1px solid var(--glass-border)"
          : "1px solid transparent",
        padding: scrolled ? "0.8rem 0" : "1.2rem 0",
      }}
    >
      <nav
        className="container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="logo"
        >
          <Link
            to="/"
            style={{
              textDecoration: "none",
              color: "var(--primary)",
              fontWeight: "800",
              fontSize: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                background:
                  "linear-gradient(135deg, var(--primary), var(--secondary))",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
              }}
            >
              V
            </div>
            Virtue Hire
          </Link>
        </motion.div>

        {/* Desktop Nav */}
        <ul
          style={{
            display: "flex",
            listStyle: "none",
            gap: "2.5rem",
            margin: 0,
            padding: 0,
          }}
          className="desktop-nav"
        >
          {navLinks.map((link, idx) => (
            <motion.li key={idx} whileHover={{ y: -2 }}>
              <Link
                to={link.path}
                onClick={closeMenu}
                style={{
                  textDecoration: "none",
                  color: "var(--text-gray)",
                  fontWeight: "500",
                  fontSize: "1rem",
                  transition: "color 0.2s ease",
                }}
                onMouseOver={(e) => (e.target.style.color = "var(--primary)")}
                onMouseOut={(e) => (e.target.style.color = "var(--text-gray)")}
              >
                {link.name}
              </Link>
            </motion.li>
          ))}
        </ul>

        <div
          style={{ display: "flex", alignItems: "center", gap: "1rem" }}
          className="desktop-nav-auth"
        >
          {isLoggedIn ? (
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "var(--shadow-md)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              style={{
                background: "var(--white)",
                color: "var(--text-gray)",
                border: "1px solid var(--medium-gray)",
                padding: "0.6rem 1.2rem",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              <LogOut size={18} />
              Logout
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "var(--shadow-md)" }}
              whileTap={{ scale: 0.95 }}
              onClick={goToLanding}
              style={{
                background:
                  "linear-gradient(135deg, var(--primary), var(--primary-light))",
                color: "white",
                border: "none",
                padding: "0.6rem 1.2rem",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                fontWeight: "600",
                boxShadow: "var(--shadow)",
              }}
            >
              <LogIn size={18} />
              Sign In
            </motion.button>
          )}
        </div>

        <button
          style={{
            background: "none",
            border: "none",
            color: "var(--dark)",
            cursor: "pointer",
          }}
          className="mobile-menu-btn-custom"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: "white",
              borderBottom: "1px solid var(--medium-gray)",
              overflow: "hidden",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div
              className="container"
              style={{
                padding: "1rem 20px",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {navLinks.map((link, idx) => (
                <Link
                  key={idx}
                  to={link.path}
                  onClick={closeMenu}
                  style={{
                    textDecoration: "none",
                    color: "var(--dark)",
                    padding: "0.5rem 0",
                    fontWeight: "500",
                    borderBottom: "1px solid var(--medium-gray)",
                  }}
                >
                  {link.name}
                </Link>
              ))}
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "var(--accent)",
                    textAlign: "left",
                    padding: "0.5rem 0",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                >
                  <LogOut size={18} /> Logout
                </button>
              ) : (
                <button
                  onClick={goToLanding}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "var(--primary)",
                    textAlign: "left",
                    padding: "0.5rem 0",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                >
                  <LogIn size={18} /> Sign In
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style
        dangerouslySetInnerHTML={{
          __html: `
                @media (min-width: 969px) {
                    .mobile-menu-btn-custom { display: none !important; }
                }
                @media (max-width: 968px) {
                    .desktop-nav, .desktop-nav-auth { display: none !important; }
                }
            `,
        }}
      />
    </motion.header>
  );
};

export default Header;
