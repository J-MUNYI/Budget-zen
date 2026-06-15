import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled UI error:", error, info?.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "1.5rem",
          background: "var(--bg)",
          color: "var(--text)",
        }}
      >
        <div
          style={{
            maxWidth: "420px",
            width: "100%",
            textAlign: "center",
            background: "var(--card-strong)",
            border: "1px solid var(--border)",
            borderRadius: "20px",
            padding: "2rem",
            boxShadow: "var(--shadow)",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>⚠️</div>
          <h1 style={{ fontSize: "1.25rem", margin: "0 0 8px" }}>Something went wrong</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "0 0 20px" }}>
            An unexpected error broke this page. Reloading usually fixes it; if it keeps
            happening, please try again later.
          </p>
          {this.state.error?.message ? (
            <p
              style={{
                color: "#ff6157",
                fontSize: "0.8rem",
                margin: "0 0 20px",
                wordBreak: "break-word",
              }}
            >
              {this.state.error.message}
            </p>
          ) : null}
          <button
            type="button"
            onClick={this.handleReload}
            style={{
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              padding: "10px 20px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }
}
