import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const userParam = searchParams.get("user");
    const error = searchParams.get("error");

    if (error) {
      navigate("/login?error=oauth_failed");
      return;
    }

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        
        // Store token and user
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        
        // Reload to update AuthContext
        window.location.href = "/dashboard";
      } catch (err) {
        console.error("Error parsing OAuth callback:", err);
        navigate("/login?error=oauth_failed");
      }
    } else {
      navigate("/login?error=oauth_failed");
    }
  }, [searchParams, navigate]);

  return (
    <div className="auth-callback-shell">
      <div className="auth-callback-card">
        <div className="auth-callback-spinner"></div>
        <p>Completing authentication...</p>
      </div>
    </div>
  );
}
