export function ShellIcon({ name }) {
  const common = {
    fill: "none",
    height: 18,
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
    width: 18,
  };

  if (name === "grid") {
    return (
      <svg {...common} aria-hidden="true">
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
      </svg>
    );
  }

  if (name === "plus") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    );
  }

  if (name === "wallet") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 16.5z" />
        <path d="M16 12h4" />
        <circle cx="16" cy="12" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (name === "chart") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M5 19V9" />
        <path d="M12 19V5" />
        <path d="M19 19v-7" />
      </svg>
    );
  }

  if (name === "moon") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M18 15.6A7.5 7.5 0 0 1 8.4 6a8.5 8.5 0 1 0 9.6 9.6z" />
      </svg>
    );
  }

  if (name === "sun") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M12 2.75v2.5" />
        <path d="M12 18.75v2.5" />
        <path d="m4.93 4.93 1.77 1.77" />
        <path d="m17.3 17.3 1.77 1.77" />
        <path d="M2.75 12h2.5" />
        <path d="M18.75 12h2.5" />
        <path d="m4.93 19.07 1.77-1.77" />
        <path d="m17.3 6.7 1.77-1.77" />
        <circle cx="12" cy="12" r="3.75" />
      </svg>
    );
  }

  return (
    <svg {...common} aria-hidden="true">
      <path d="M12 3v4" />
      <path d="M12 17v4" />
      <path d="M4.93 4.93l2.83 2.83" />
      <path d="M16.24 16.24l2.83 2.83" />
      <path d="M3 12h4" />
      <path d="M17 12h4" />
      <path d="M4.93 19.07l2.83-2.83" />
      <path d="M16.24 7.76l2.83-2.83" />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  );
}

export function InstagramIcon({ className = "" }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3.75" y="3.75" width="16.5" height="16.5" rx="5.25" />
      <circle cx="12" cy="12" r="3.75" />
      <circle cx="17.25" cy="6.75" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
