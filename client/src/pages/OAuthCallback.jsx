import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const userParam = searchParams.get("user");

    if (token && userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        loginWithToken(token, userData);
        navigate("/dashboard", { replace: true });
      } catch {
        navigate("/login?error=oauth_failed", { replace: true });
      }
    } else {
      navigate("/login?error=oauth_failed", { replace: true });
    }
  }, []);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      color: "var(--text)",
      fontSize: "1rem",
    }}>
      <p>Signing you in...</p>
    </div>
  );
}