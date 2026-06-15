import { API_URL } from "../api/client";
import { GoogleIcon, InstagramIcon } from "./ui/AppIcons";

function startOAuth(provider) {
  if (provider === "Google") {
    window.location.href = `${API_URL}/api/auth/google`;
  } else if (provider === "Instagram") {
    window.location.href = `${API_URL}/api/auth/instagram`;
  }
}

export default function SocialAuthButtons({ oauthProviders }) {
  return (
    <>
      <button
        type="button"
        onClick={() => startOAuth("Google")}
        className="auth-social-button"
        disabled={!oauthProviders.google}
        title={!oauthProviders.google ? "Google sign-in is not configured" : undefined}
      >
        <span className="auth-social-mark is-google">
          <GoogleIcon className="auth-social-icon" />
        </span>
        <span>Continue with Google</span>
      </button>
      <button
        type="button"
        onClick={() => startOAuth("Instagram")}
        className="auth-social-button"
        disabled={!oauthProviders.instagram}
        title={!oauthProviders.instagram ? "Instagram sign-in is not configured" : undefined}
      >
        <span className="auth-social-mark is-instagram">
          <InstagramIcon className="auth-social-icon" />
        </span>
        <span>Continue with Instagram</span>
      </button>
    </>
  );
}
