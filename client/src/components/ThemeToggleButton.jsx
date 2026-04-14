import { useTheme } from "../context/useTheme";
import { ShellIcon } from "./ui/AppIcons";

export default function ThemeToggleButton({ className = "", compact = false }) {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === "light" ? "dark" : "light";

  return (
    <button
      type="button"
      className={`shell-icon-button shell-theme-button${compact ? " is-compact" : ""}${className ? ` ${className}` : ""}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
    >
      <span className="shell-theme-orb" aria-hidden="true">
        <ShellIcon name={theme === "light" ? "moon" : "sun"} />
      </span>
      <span>{nextTheme === "dark" ? "Dark" : "Light"}</span>
    </button>
  );
}
