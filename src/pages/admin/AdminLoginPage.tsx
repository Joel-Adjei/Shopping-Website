import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";
import { btnPrimary, eyebrow, fieldInput, fieldLabel } from "../../lib/ui";

function AdminLoginPage() {
  const session = useAuthStore((state) => state.session);
  const loading = useAuthStore((state) => state.loading);
  const message = useAuthStore((state) => state.error);
  const signIn = useAuthStore((state) => state.signIn);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Start at the top, and clear any old sign-in error when leaving the page.
  useEffect(() => {
    window.scrollTo(0, 0);
    return () => useAuthStore.setState({ error: "" });
  }, []);

  if (session) return <Navigate to="/admin" replace />;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    void signIn(email, password);
  }

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-x-clip bg-cream-100  font-sans text-navy-900 antialiased selection:bg-gold-500/30">

      <div className="flex flex-1 items-center justify-center">
        <div className="grid w-full h-screen overflow-hidden bg-white/70 shadow-[0_40px_90px_-60px_rgba(10,36,61,0.7)] backdrop-blur-sm  lg:grid-cols-2">
          <div className="relative flex min-h-[260px] items-end overflow-hidden p-7 text-cream-50 sm:min-h-[340px] lg:min-h-full lg:p-12">
            <img
              className="absolute inset-0 h-full w-full object-cover saturate-[0.8]"
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85"
              alt=""
            />
            <div className="absolute inset-0 bg-linear-to-br from-navy-950/85 via-navy-900/70 to-forest-900/80" />
            <div className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-gold-500/20 blur-3xl" />
            <div className="relative z-10">
              <span className={`${eyebrow} text-gold-300`}>BEHIND THE EDIT</span>
              <h1 className="my-5 font-serif text-[40px] font-semibold leading-[1.07] tracking-[-0.045em] text-cream-50 lg:text-[49px]">
                Good taste
                <br />
                needs{" "}
                <em className="bg-linear-to-r from-gold-300 via-gold-400 to-gold-500 bg-clip-text font-hero font-normal italic text-transparent">
                  good care.
                </em>
              </h1>
              <p className="max-w-[260px] text-[11px] leading-[1.9] text-cream-200/70 sm:max-w-[300px]">
                Your private space to manage the pieces, the orders and the
                details that make Stylish Steps Collection.
              </p>
              <div className="mt-6 text-[8px] uppercase tracking-[0.17em] text-cream-200/45 lg:mt-12">
                SSC STUDIO · ACCRA
              </div>
            </div>
          </div>
          <form className="flex flex-col justify-center gap-4 p-7 sm:p-10 lg:p-12" onSubmit={submit}>
            <span className={eyebrow}>WELCOME BACK</span>
            <h2 className="font-serif text-[32px] font-semibold tracking-[-0.03em] text-navy-900 lg:text-[35px]">
              Admin sign in
            </h2>
            <p className="-mt-2 mb-1 text-[11px] text-navy-900/55">
              Sign in to access your store dashboard.
            </p>
            <label className={fieldLabel}>
              Email address
              <input
                className={fieldInput}
                required
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourstore.com"
              />
            </label>
            <div className={fieldLabel}>
              <label htmlFor="admin-password">Password</label>
              <div className="relative">
                <input
                  id="admin-password"
                  className={`${fieldInput} pr-11`}
                  required
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-navy-900/40 transition-colors hover:bg-cream-200 hover:text-forest-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {message && (
              <div
                className="rounded-sm border border-red-900/20 bg-red-900/5 p-3 text-[10px] leading-relaxed text-red-900/80"
                role="alert"
              >
                {message}
              </div>
            )}
            <button className={`${btnPrimary} mt-1 w-full justify-between`} disabled={loading}>
              {loading ? "Signing in…" : "Enter your dashboard"} <ArrowRight size={16} />
            </button>
            <small className="mt-1 text-[9px] leading-relaxed text-navy-900/40">
              Admin accounts should be provisioned securely in Supabase Auth.
              Public sign-up is not enabled here.
            </small>
          </form>
        </div>
      </div>
    </main>
  );
}

export default AdminLoginPage;
