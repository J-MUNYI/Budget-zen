import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AuthShell from "../components/AuthShell";
import SocialAuthButtons from "../components/SocialAuthButtons";
import { formatKES } from "../utils/format";
import { isValidEmail } from "../utils/validators";
import { inputClassName } from "../utils/authForm";

const sampleData = [
  { name: "Mon", value: 1200 },
  { name: "Tue", value: 2600 },
  { name: "Wed", value: 3200 },
  { name: "Thu", value: 4700 },
  { name: "Fri", value: 5200 },
  { name: "Sat", value: 6100 },
  { name: "Sun", value: 7200 },
];

const strengthStyles = {
  red: { label: "Very Weak", color: "#ff6157", width: "20%" },
  orange: { label: "Weak", color: "#ff9c3f", width: "40%" },
  yellow: { label: "Fair", color: "#ffcf5b", width: "60%" },
  lime: { label: "Good", color: "#9cd764", width: "80%" },
  green: { label: "Strong", color: "#24b36b", width: "100%" },
  default: { label: "", color: "var(--border-strong)", width: "0%" },
};

function AuthAreaChartPreview() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={sampleData} margin={{ top: 12, right: 16, left: -22, bottom: 0 }}>
        <defs>
          <linearGradient id="authAreaFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="6 8" vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "var(--text-soft)", fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--text-soft)", fontSize: 11 }} tickFormatter={(value) => `${value / 1000}k`} />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--card-strong)",
            border: "1px solid var(--border)",
            borderRadius: "18px",
            color: "var(--text)",
          }}
          formatter={(value) => [formatKES(value), "Projected progress"]}
          labelStyle={{ color: "var(--text-muted)" }}
        />
        <Area type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={3.5} fill="url(#authAreaFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register, oauthProviders } = useAuth();
  const navigate = useNavigate();

  const getPasswordStrength = (pwd) => {
    if (!pwd) return strengthStyles.default;

    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

    const levels = [
      strengthStyles.red,
      strengthStyles.orange,
      strengthStyles.yellow,
      strengthStyles.lime,
      strengthStyles.green,
    ];

    return levels[Math.min(strength - 1, 4)] || strengthStyles.default;
  };

  const strengthStyle = getPasswordStrength(password);

  const validateField = (fieldName, value, currentErrors = {}) => {
    const errors = { ...currentErrors };

    switch (fieldName) {
      case "name":
        if (!value.trim()) {
          errors.name = "Name is required";
        } else if (value.trim().length < 2) {
          errors.name = "Name must be at least 2 characters";
        } else {
          delete errors.name;
        }
        break;

      case "email": {
        if (!value) {
          errors.email = "Email is required";
        } else if (!isValidEmail(value)) {
          errors.email = "Please enter a valid email address";
        } else {
          delete errors.email;
        }
        break;
      }

      case "password":
        if (!value) {
          errors.password = "Password is required";
        } else if (value.length < 6) {
          errors.password = "Password must be at least 6 characters";
        } else {
          delete errors.password;
        }

        if (confirmPassword && value !== confirmPassword) {
          errors.confirmPassword = "Passwords do not match";
        } else if (confirmPassword) {
          delete errors.confirmPassword;
        }
        break;

      case "confirmPassword":
        if (!value) {
          errors.confirmPassword = "Please confirm your password";
        } else if (value !== password) {
          errors.confirmPassword = "Passwords do not match";
        } else {
          delete errors.confirmPassword;
        }
        break;

      default:
        break;
    }

    return errors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    let nextFieldErrors = validateField("name", name);
    nextFieldErrors = validateField("email", email, nextFieldErrors);
    nextFieldErrors = validateField("password", password, nextFieldErrors);
    nextFieldErrors = validateField("confirmPassword", confirmPassword, nextFieldErrors);

    setFieldErrors(nextFieldErrors);

    if (Object.keys(nextFieldErrors).length) {
      setError("Please fix the highlighted fields before continuing.");
      return;
    }

    setLoading(true);

    const result = await register(name, email, password);

    if (result.success) {
      navigate("/dashboard");
    } else {
      if (result.validationErrors) {
        setFieldErrors(result.validationErrors);
        setError(result.error || "Please fix the errors below");
      } else if (result.error) {
        setError(result.error);
      } else {
        setError("Registration failed. Please try again.");
      }
    }

    setLoading(false);
  };

  return (
    <AuthShell
      eyebrow="Create your account"
      title="Start with the same premium visual language as the logged-in dashboard."
      copy="Registration now flows through the same brighter card system, cleaner spacing, and calmer money-first presentation."
      statLabel="Projected savings runway"
      statValue="KES 7,200"
      chart={<AuthAreaChartPreview />}
      formTitle="Sign up"
      formCopy="Build your account once and move directly into the refreshed dashboard experience."
      error={error}
      socialButtons={<SocialAuthButtons oauthProviders={oauthProviders} />}
      dividerLabel="or sign up with email"
      loading={loading}
      form={
        <form className="auth-form" onSubmit={handleRegister}>
          <div className="auth-form-field">
            <label className="auth-form-label">Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFieldErrors((prev) => validateField("name", e.target.value, prev));
              }}
              onBlur={(e) => setFieldErrors((prev) => validateField("name", e.target.value, prev))}
              className={inputClassName(fieldErrors.name)}
            />
            {fieldErrors.name ? <p className="auth-field-error">{fieldErrors.name}</p> : null}
          </div>

          <div className="auth-form-field">
            <label className="auth-form-label">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldErrors((prev) => validateField("email", e.target.value, prev));
              }}
              onBlur={(e) => setFieldErrors((prev) => validateField("email", e.target.value, prev))}
              className={inputClassName(fieldErrors.email)}
            />
            {fieldErrors.email ? <p className="auth-field-error">{fieldErrors.email}</p> : null}
          </div>

          <div className="auth-form-field">
            <label className="auth-form-label">Password</label>
            <div className={`auth-password-row${fieldErrors.password ? " is-error" : ""}`}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors((prev) => validateField("password", e.target.value, prev));
                }}
                onBlur={(e) => setFieldErrors((prev) => validateField("password", e.target.value, prev))}
                className="auth-form-input auth-form-input-plain"
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

            {password && !fieldErrors.password ? (
              <div className="auth-strength-row">
                <div className="auth-strength-track">
                  <div
                    className="auth-strength-fill"
                    style={{ width: strengthStyle.width, backgroundColor: strengthStyle.color }}
                  />
                </div>
                <span className="auth-strength-label" style={{ color: strengthStyle.color }}>
                  {strengthStyle.label}
                </span>
              </div>
            ) : null}
          </div>

          <div className="auth-form-field">
            <label className="auth-form-label">Confirm Password</label>
            <div className={`auth-password-row${fieldErrors.confirmPassword ? " is-error" : ""}`}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setFieldErrors((prev) => validateField("confirmPassword", e.target.value, prev));
                }}
                onBlur={(e) => setFieldErrors((prev) => validateField("confirmPassword", e.target.value, prev))}
                className="auth-form-input auth-form-input-plain"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="auth-password-toggle"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            {fieldErrors.confirmPassword ? (
              <p className="auth-field-error">{fieldErrors.confirmPassword}</p>
            ) : null}
          </div>

          <button type="submit" disabled={loading} className="auth-submit-button">
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
      }
      footer={
        <p className="auth-footer-copy">
          Already have an account?{" "}
          <Link to="/login" className="auth-footer-link">
            Log in
          </Link>
        </p>
      }
      bottomCard={
        <div className="auth-insight-grid">
          <div className="auth-insight-card">
            <p className="auth-insight-label">Onboarding</p>
            <p className="auth-insight-value">Fast start</p>
          </div>
          <div className="auth-insight-card">
            <p className="auth-insight-label">Destination</p>
            <p className="auth-insight-value">Dashboard ready</p>
          </div>
        </div>
      }
    />
  );
}
