import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const sampleData = [
  { name: "Mon", value: 400 },
  { name: "Tue", value: 800 },
  { name: "Wed", value: 600 },
  { name: "Thu", value: 1200 },
  { name: "Fri", value: 900 },
  { name: "Sat", value: 1400 },
  { name: "Sun", value: 1100 },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check for OAuth error in URL
  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError === "oauth_failed") {
      setError("OAuth authentication failed. Please try again or use email/password.");
    }
  }, [searchParams]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setError("");
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error || "Login failed. Please try again.");
    }

    setLoading(false);
  };

  const handleSocialLogin = (provider) => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    if (provider === "Google") {
      window.location.href = `${API_URL}/api/auth/google`;
    } else if (provider === "Facebook") {
      window.location.href = `${API_URL}/api/auth/facebook`;
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col px-4 bg-black relative overflow-hidden"
      style={{
        backgroundColor: "#020617",
      }}
    >
      {/* Top navigation */}
      <header className="absolute top-4 left-0 right-0 px-6 md:px-16 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center text-black font-extrabold text-lg">
            BZ
          </div>
          <span className="text-yellow-400 font-semibold text-lg tracking-wide">
            Budget Zen
          </span>
        </div>
        <nav className="flex items-center gap-6 text-sm md:text-base">
          <Link
            to="/about"
            className="text-gray-200 hover:text-yellow-400 transition-colors"
          >
            About
          </Link>
          <Link
            to="/how-it-works"
            className="text-gray-200 hover:text-yellow-400 transition-colors"
          >
            How it works
          </Link>
        </nav>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex justify-center pt-24 pb-8">
        <section className="w-full max-w-6xl flex flex-col lg:flex-row gap-6">
          {/* Left side - message + graph */}
          <div className="w-full lg:w-1/2 p-6 md:p-10 flex flex-col justify-between bg-black/50">
            <div>
              <p className="uppercase tracking-[0.25em] text-yellow-400 text-xs mb-4">
                Smart money, calm mind
              </p>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 leading-tight">
                Be wise with your coins
              </h1>
              <p className="text-gray-300 text-sm md:text-base max-w-md">
                Turn everyday spending into mindful savings. Track, plan, and
                grow your wealth with clarity and confidence.
              </p>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-300">
                  Weekly cash flow overview
                </p>
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-400 text-black font-semibold">
                  +18.4%
                </span>
              </div>
              <div className="h-52 md:h-72 bg-black bg-opacity-60 rounded-xl border border-yellow-500/30 px-4 pt-4 pb-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sampleData}>
                    <XAxis
                      dataKey="name"
                      stroke="#facc15"
                      tickLine={false}
                      tick={{ fill: "#e5e7eb", fontSize: 12 }}
                    />
                    <YAxis
                      stroke="#facc15"
                      tickLine={false}
                      tick={{ fill: "#e5e7eb", fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#020617",
                        border: "1px solid rgba(250, 204, 21, 0.5)",
                        borderRadius: "0.75rem",
                        color: "#facc15",
                        fontSize: "0.75rem",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#facc15"
                      strokeWidth={3}
                      dot={{ r: 3, stroke: "#0f172a", strokeWidth: 2 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right side - login form */}
          <div className="w-full lg:w-1/2 p-6 md:p-10 flex flex-col justify-center bg-black/80">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Welcome back
            </h2>
            <p className="text-sm text-gray-300 mb-6">
              Log in to keep your budget balanced and your goals on track.
            </p>

            {/* Error message */}
            {error && (
              <p className="text-red-400 bg-red-900/40 border border-red-500/40 text-sm rounded-lg px-3 py-2 mb-4">
                {error}
              </p>
            )}

            {/* Social login */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <button
                type="button"
                onClick={() => handleSocialLogin("Google")}
                className="flex-1 inline-flex items-center justify-center gap-2 border border-gray-500/60 rounded-lg px-4 py-2.5 text-sm text-gray-100 hover:border-yellow-400 hover:bg-yellow-400/10 transition"
              >
                <span className="text-lg">G</span>
                <span>Continue with Google</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin("Facebook")}
                className="flex-1 inline-flex items-center justify-center gap-2 border border-gray-500/60 rounded-lg px-4 py-2.5 text-sm text-gray-100 hover:border-yellow-400 hover:bg-yellow-400/10 transition"
              >
                <span className="text-lg">f</span>
                <span>Continue with Facebook</span>
              </button>
            </div>

            <div className="flex items-center mb-5">
              <div className="flex-grow h-px bg-gray-600" />
              <span className="mx-3 text-xs uppercase tracking-[0.3em] text-gray-400">
                or start now
              </span>
              <div className="flex-grow h-px bg-gray-600" />
            </div>

            {/* Form */}
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg bg-black bg-opacity-60 border border-gray-600 px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Password
                </label>
                <div className="flex items-center rounded-lg bg-black bg-opacity-60 border border-gray-600 px-3 py-1.5 focus-within:ring-2 focus-within:ring-yellow-400 focus-within:border-yellow-400">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-grow bg-transparent outline-none px-1 py-1 text-sm text-gray-100 placeholder-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs font-semibold text-yellow-400 hover:text-yellow-300 transition px-2"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs mb-1">
                <label className="inline-flex items-center gap-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-500 bg-black text-yellow-400 focus:ring-yellow-400"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-gray-300 hover:text-yellow-400 transition"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-400 text-black font-semibold py-2.5 rounded-lg hover:bg-yellow-300 transition shadow-[0_0_30px_rgba(250,204,21,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Logging in..." : "Start now"}
              </button>
            </form>

            <p className="mt-4 text-sm text-gray-300 text-center">
              New to Budget Zen?{" "}
              <Link
                to="/register"
                className="text-yellow-400 font-semibold hover:text-yellow-300"
              >
                Create an account
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
