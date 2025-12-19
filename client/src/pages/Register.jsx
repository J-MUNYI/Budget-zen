import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const { register } = useAuth();
  const navigate = useNavigate();

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { strength: 0, label: "", color: "" };
    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

    const levels = [
      { label: "Very Weak", color: "red" },
      { label: "Weak", color: "orange" },
      { label: "Fair", color: "yellow" },
      { label: "Good", color: "lime" },
      { label: "Strong", color: "green" },
    ];
    return levels[Math.min(strength - 1, 4)] || { label: "", color: "" };
  };

  const passwordStrength = getPasswordStrength(password);

  // Validate individual fields
  const validateField = (fieldName, value) => {
    const errors = { ...fieldErrors };
    
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
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          errors.email = "Email is required";
        } else if (!emailRegex.test(value)) {
          errors.email = "Please enter a valid email address";
        } else {
          delete errors.email;
        }
        break;
      case "password":
        if (!value) {
          errors.password = "Password is required";
        } else if (value.length < 6) {
          errors.password = "Password must be at least 6 characters";
        } else {
          delete errors.password;
        }
        // Re-validate confirm password if it exists
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
    }
    
    setFieldErrors(errors);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Validate all fields
    validateField("name", name);
    validateField("email", email);
    validateField("password", password);
    validateField("confirmPassword", confirmPassword);

    // Check if there are any field errors
    const hasErrors = Object.keys(fieldErrors).length > 0 || 
                      !name || !email || !password || !confirmPassword ||
                      password !== confirmPassword || password.length < 6;

    if (hasErrors) {
      // Re-validate to show all errors
      if (!name) validateField("name", "");
      if (!email) validateField("email", "");
      if (!password) validateField("password", "");
      if (!confirmPassword) validateField("confirmPassword", "");
      if (password && confirmPassword && password !== confirmPassword) {
        validateField("confirmPassword", confirmPassword);
      }
      return;
    }

    setLoading(true);

    const result = await register(name, email, password);

    if (result.success) {
      navigate("/dashboard");
    } else {
      // Handle backend validation errors
      if (result.error) {
        // Check if it's a validation error object
        try {
          const errorData = JSON.parse(result.error);
          if (errorData.errors && Array.isArray(errorData.errors)) {
            // Map backend validation errors to field errors
            const backendErrors = {};
            errorData.errors.forEach((err) => {
              backendErrors[err.param] = err.msg;
            });
            setFieldErrors(backendErrors);
            setError("Please fix the errors below");
          } else {
            setError(result.error);
          }
        } catch {
          // If not JSON, it's a regular error message
          setError(result.error);
        }
      } else {
        setError("Registration failed. Please try again.");
      }
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
                Start your financial journey
              </h1>
              <p className="text-gray-300 text-sm md:text-base max-w-md">
                Join thousands who are taking control of their finances. Create
                your account and begin tracking your expenses with clarity and
                confidence.
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

          {/* Right side - registration form */}
          <div className="w-full lg:w-1/2 p-6 md:p-10 flex flex-col justify-center bg-black/80">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Create your account
            </h2>
            <p className="text-sm text-gray-300 mb-6">
              Sign up to start managing your budget and achieve your financial
              goals.
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
                or sign up
              </span>
              <div className="flex-grow h-px bg-gray-600" />
            </div>

            {/* Form */}
            <form className="space-y-4" onSubmit={handleRegister}>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    validateField("name", e.target.value);
                  }}
                  onBlur={(e) => validateField("name", e.target.value)}
                  className={`w-full rounded-lg bg-black bg-opacity-60 border px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 ${
                    fieldErrors.name
                      ? "border-red-500 focus:ring-red-400 focus:border-red-400"
                      : "border-gray-600 focus:ring-yellow-400 focus:border-yellow-400"
                  }`}
                />
                {fieldErrors.name && (
                  <p className="text-red-400 text-xs mt-1">{fieldErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    validateField("email", e.target.value);
                  }}
                  onBlur={(e) => validateField("email", e.target.value)}
                  className={`w-full rounded-lg bg-black bg-opacity-60 border px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 ${
                    fieldErrors.email
                      ? "border-red-500 focus:ring-red-400 focus:border-red-400"
                      : "border-gray-600 focus:ring-yellow-400 focus:border-yellow-400"
                  }`}
                />
                {fieldErrors.email && (
                  <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Password
                </label>
                <div
                  className={`flex items-center rounded-lg bg-black bg-opacity-60 border px-3 py-1.5 focus-within:ring-2 ${
                    fieldErrors.password
                      ? "border-red-500 focus-within:ring-red-400 focus-within:border-red-400"
                      : "border-gray-600 focus-within:ring-yellow-400 focus-within:border-yellow-400"
                  }`}
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      validateField("password", e.target.value);
                    }}
                    onBlur={(e) => validateField("password", e.target.value)}
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
                {fieldErrors.password && (
                  <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>
                )}
                {password && !fieldErrors.password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            passwordStrength.color === "red"
                              ? "bg-red-500"
                              : passwordStrength.color === "orange"
                              ? "bg-orange-500"
                              : passwordStrength.color === "yellow"
                              ? "bg-yellow-400"
                              : passwordStrength.color === "lime"
                              ? "bg-lime-400"
                              : "bg-green-500"
                          }`}
                          style={{
                            width: `${
                              passwordStrength.color === "red"
                                ? "20%"
                                : passwordStrength.color === "orange"
                                ? "40%"
                                : passwordStrength.color === "yellow"
                                ? "60%"
                                : passwordStrength.color === "lime"
                                ? "80%"
                                : "100%"
                            }`,
                          }}
                        />
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          passwordStrength.color === "red"
                            ? "text-red-400"
                            : passwordStrength.color === "orange"
                            ? "text-orange-400"
                            : passwordStrength.color === "yellow"
                            ? "text-yellow-400"
                            : passwordStrength.color === "lime"
                            ? "text-lime-400"
                            : "text-green-400"
                        }`}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Confirm Password
                </label>
                <div
                  className={`flex items-center rounded-lg bg-black bg-opacity-60 border px-3 py-1.5 focus-within:ring-2 ${
                    fieldErrors.confirmPassword
                      ? "border-red-500 focus-within:ring-red-400 focus-within:border-red-400"
                      : "border-gray-600 focus-within:ring-yellow-400 focus-within:border-yellow-400"
                  }`}
                >
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      validateField("confirmPassword", e.target.value);
                    }}
                    onBlur={(e) => validateField("confirmPassword", e.target.value)}
                    className="flex-grow bg-transparent outline-none px-1 py-1 text-sm text-gray-100 placeholder-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="text-xs font-semibold text-yellow-400 hover:text-yellow-300 transition px-2"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">{fieldErrors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-400 text-black font-semibold py-2.5 rounded-lg hover:bg-yellow-300 transition shadow-[0_0_30px_rgba(250,204,21,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="mt-4 text-sm text-gray-300 text-center">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-yellow-400 font-semibold hover:text-yellow-300"
              >
                Log in
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
