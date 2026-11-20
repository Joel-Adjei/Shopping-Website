import { CircleUserRound, Menu, Moon, Search, ShoppingBag, Sun, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { selectCartCount, useCartStore } from "../stores/useCartStore";
import { useShopFilterStore } from "../stores/useShopFilterStore";
import { useThemeStore } from "../stores/useThemeStore";
import { useUIStore } from "../stores/useUIStore";
import { logos } from "../assets/asset";
import { iconButton } from "../lib/ui";

const navLinks = [
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const EASE = [0.22, 0.61, 0.36, 1] as const;

export default function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const cartCount = useCartStore(selectCartCount);
  const mobileMenu = useUIStore((state) => state.mobileMenu);
  const searchOpen = useUIStore((state) => state.searchOpen);
  const toggleMobileMenu = useUIStore((state) => state.toggleMobileMenu);
  const closeMobileMenu = useUIStore((state) => state.closeMobileMenu);
  const setSearchOpen = useUIStore((state) => state.setSearchOpen);
  const openCart = useUIStore((state) => state.openCart);
  const search = useShopFilterStore((state) => state.search);
  const setSearch = useShopFilterStore((state) => state.setSearch);
  const resetFilters = useShopFilterStore((state) => state.reset);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isAdmin = pathname.startsWith("/admin");

  // Search results live on the shop page, so typing from anywhere else takes you there.
  const onSearch = (value: string) => {
    if (pathname !== "/shop") {
      resetFilters();
      navigate("/shop");
    }
    setSearch(value);
  };

  return (
    <>
      <motion.header
        className="sticky top-0 z-30 grid h-[72px] grid-cols-[36px_1fr_auto] items-center gap-2 border-b border-navy-900/10 bg-cream-100/85 px-4 backdrop-blur-xl sm:h-[78px] sm:px-[4%] md:grid-cols-[1fr_auto_1fr] md:gap-6 lg:h-[86px] lg:px-[5.4%]"
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
      >
        <button
          className={`${iconButton} md:hidden`}
          aria-label="Open menu"
          onClick={toggleMobileMenu}
        >
          {mobileMenu ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Link
          to="/"
          className="group flex w-max items-center gap-2 justify-self-center md:col-start-1 md:justify-self-start md:gap-3"
          aria-label="Stylish Steps Collection home"
        >
          <img
            src={logos.SSC_logo}
            alt=""
            className="h-9 w-[26px] shrink-0 object-contain transition-transform duration-500 ease-out group-hover:-rotate-3 group-hover:scale-105 sm:h-[41px] sm:w-[30px] lg:h-[46px] lg:w-[34px]"
            aria-hidden="true"
          />
          <span className="flex flex-col gap-1 leading-none">
            <span className="font-serif text-[15px] font-semibold tracking-[0.01em] text-navy-900 transition-colors group-hover:text-forest-700 sm:text-[17px] lg:text-[19px]">
              Stylish Steps
            </span>
            <span className="bg-linear-to-r from-gold-600 via-gold-500 to-forest-600 bg-clip-text text-[6.5px] font-semibold uppercase tracking-[0.28em] text-transparent sm:text-[7px] lg:text-[8px] lg:tracking-[0.36em]">
              Collection
            </span>
          </span>
        </Link>
        <nav
          className="hidden justify-center gap-5 md:col-start-2 md:flex lg:gap-8"
          aria-label="Main navigation"
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `group relative py-1.5 text-[9px] font-medium uppercase tracking-[0.12em] transition-colors lg:text-[10px] lg:tracking-[0.16em] ${
                  isActive ? "text-navy-900" : "text-navy-800/65 hover:text-forest-700"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  <span
                    className={`absolute inset-x-0 bottom-0 h-px origin-left bg-linear-to-r from-gold-500 via-gold-400 to-forest-600 transition-transform duration-300 ${
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center justify-self-end gap-0.5 md:col-start-3 md:gap-2.5">
          <motion.button
            className={iconButton}
            aria-label="Search products"
            onClick={() => setSearchOpen(!searchOpen)}
            whileTap={{ scale: 0.9 }}
          >
            <Search size={19} />
          </motion.button>
          {!isAdmin && (
            <motion.button
              className={iconButton}
              aria-label={theme === "noir" ? "Switch to light mode" : "Switch to premium night mode"}
              aria-pressed={theme === "noir"}
              title={theme === "noir" ? "Light mode" : "Premium night mode"}
              onClick={toggleTheme}
              whileTap={{ scale: 0.9 }}
            >
              {theme === "noir" ? <Sun size={19} /> : <Moon size={19} />}
            </motion.button>
          )}
          <motion.button
            className={`${iconButton} hidden sm:grid`}
            aria-label="Admin sign in"
            onClick={() => navigate("/admin")}
            whileTap={{ scale: 0.9 }}
          >
            <CircleUserRound size={19} />
          </motion.button>
          <motion.button
            className="flex items-center gap-1.5 rounded-full px-2 py-1.5 text-navy-900 transition-colors hover:bg-cream-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 sm:gap-2 sm:px-2.5"
            onClick={openCart}
            aria-label={`Open shopping bag, ${cartCount} items`}
            whileTap={{ scale: 0.96 }}
          >
            <ShoppingBag size={19} />
            <span className="hidden text-[10px] uppercase tracking-[0.14em] sm:inline">Bag</span>
            <motion.span
              key={cartCount}
              className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-linear-to-br from-forest-700 to-navy-900 px-1 text-[9px] font-semibold text-cream-50 sm:h-[21px] sm:min-w-[21px]"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 520, damping: 24 }}
            >
              {cartCount}
            </motion.span>
          </motion.button>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            className="sticky top-[72px] z-20 flex flex-col gap-1 border-b border-navy-900/10 bg-cream-100/95 px-4 py-3 backdrop-blur-xl sm:top-[78px] md:hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: EASE }}
          >
            {navLinks.map((link, index) => (
              <motion.div
                key={link.to}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + index * 0.05, duration: 0.25 }}
              >
                <NavLink
                  to={link.to}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-3 text-[11px] font-medium uppercase tracking-[0.18em] transition-colors ${
                      isActive
                        ? "bg-cream-50/70 text-forest-700"
                        : "text-navy-800/75 hover:bg-cream-50/50 hover:text-forest-700"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="sticky top-[72px] z-20 flex items-center gap-3 overflow-hidden border-b border-navy-900/10 bg-cream-200/95 px-5 text-navy-900 backdrop-blur-xl sm:top-[78px] lg:top-[86px] lg:px-[5.4%]"
            initial={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0 }}
            animate={{ opacity: 1, height: "auto", paddingTop: 14, paddingBottom: 14 }}
            exit={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <Search size={18} className="shrink-0 text-gold-600" />
            <input
              autoFocus
              placeholder="Search the collection…"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-navy-900 outline-none placeholder:text-navy-900/40"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
            />
            <button
              className={`${iconButton} h-8 w-8`}
              onClick={() => {
                setSearch("");
                setSearchOpen(false);
              }}
              aria-label="Close search"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
