import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AuthShell from "../components/AuthShell";
import { GoogleIcon, InstagramIcon } from "../components/ui/AppIcons";

const sampleData = [
  { name: "Mon", value: 3200 },
  { name: "Tue", value: 4700 },
  { name: "Wed", value: 4100 },
  { name: "Thu", value: 5980 },
  { name: "Fri", value: 5400 },
  { name: "Sat", value: 6900 },
  { name: "Sun", value: 6300 },
];

function AuthChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={sampleData} margin={{ top: 12, right: 16, left: -22, bottom: 0 }}>
        <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="6 8" vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--text-soft)", fontSize: 12 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--text-soft)", fontSize: 11 }}
          tickFormatter={(value) => `${value / 1000}k`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--card-strong)",
            border: "1px solid var(--border)",
            borderRadius: "18px",
            color: "var(--text)",
          }}
          formatter={(value) => [`KES ${Number(value).toLocaleString()}`, "Income"]}
          labelStyle={{ color: "var(--text-muted)" }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="var(--line-start)"
          strokeWidth={4}
          dot={{ fill: "var(--card-strong)", r: 4, stroke: "var(--line-start)", strokeWidth: 2 }}
          activeDot={{ r: 6, fill: "var(--card-strong)", stroke: "var(--line-start)", strokeWidth: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError === "oauth_failed") {
      setError("OAuth authentication failed. Please try again or use email/password.");
    }
  }, [searchParams]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    if (!email || !password) {
      const nextFieldErrors = {};
      if (!email) nextFieldErrors.email = "Email is required";
      if (!password) nextFieldErrors.password = "Password is required";
      setFieldErrors(nextFieldErrors);
      setError("Please enter both email and password.");
      return;
    }

    setError("");
    setLoading(true);

    const result = await login(email.trim(), password);

    if (result.success) {
      navigate("/dashboard");
    } else {
      if (result.validationErrors) {
        setFieldErrors(result.validationErrors);
      }
      setError(result.error || "Login failed. Please try again.");
    }

    setLoading(false);
  };

  const handleSocialLogin = (provider) => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    if (provider === "Google") {
      window.location.href = `${API_URL}/api/auth/google`;
    } else if (provider === "Instagram") {
      window.location.href = `${API_URL}/api/auth/instagram`;
    }
  };

  const inputClassName = (hasError) =>
    `auth-form-input${hasError ? " is-error" : ""}`;

  return (
    <AuthShell
      eyebrow="Welcome back!"
      title="Sign in to the same polished workspace you land in after login."
      copy="Sign up if you are new."
      statLabel="Weekly cash flow"
      statValue="+18.4%"
      chart={<AuthChart />}
      formTitle="Log in"
      formCopy="Continue with a provider or use your email to get back to your budgeting overview."
      error={error}
      socialButtons={
        <>
          <button type="button" onClick={() => handleSocialLogin("Google")} className="auth-social-button">
            <span className="auth-social-mark is-google">
              <GoogleIcon className="auth-social-icon" />
            </span>
            <span>Continue with Google</span>
          </button>
          <button type="button" onClick={() => handleSocialLogin("Instagram")} className="auth-social-button">
            <span className="auth-social-mark is-instagram">
              <InstagramIcon className="auth-social-icon" />
            </span>
            <span>Continue with Instagram</span>
          </button>
        </>
      }
      dividerLabel="or continue with email"
      form={
        <form className="auth-form" onSubmit={handleLogin}>
          <div className="auth-form-field">
            <label className="auth-form-label">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              className={inputClassName(Boolean(fieldErrors.email))}
            />
            {fieldErrors.email ? <p className="auth-field-error">{fieldErrors.email}</p> : null}
          </div>

          <div className="auth-form-field">
            <label className="auth-form-label">Password</label>
            <div className="auth-password-row">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                className={`${inputClassName(Boolean(fieldErrors.password))} auth-form-input-plain`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="auth-password-toggle"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {fieldErrors.password ? <p className="auth-field-error">{fieldErrors.password}</p> : null}
          </div>

          <div className="auth-meta-row">
            <label className="auth-checkbox-row">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <button type="button" className="auth-link-button">
              Forgot password?
            </button>
          </div>

          <button type="submit" disabled={loading} className="auth-submit-button">
            {loading ? "Logging in..." : "Enter dashboard"}
          </button>
        </form>
      }
      footer={
        <p className="auth-footer-copy">
          New to Budget Zen?{" "}
          <Link to="/register" className="auth-footer-link">
            Create an account
          </Link>
        </p>
      }
      bottomCard={
        <div className="auth-insight-grid">
          <div className="auth-insight-card">
            <p className="auth-insight-label">Themes</p>
            <p className="auth-insight-value">Light or dark</p>
          </div>
          <div className="auth-insight-card">
            <p className="auth-insight-label">Focus</p>
            <p className="auth-insight-value">Calm budgeting</p>
          </div>
        </div>
      }
    />
  );
}
