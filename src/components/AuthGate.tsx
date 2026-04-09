import { useAuth } from "../hooks/useAuth";
import LoginOverlay from "./LoginOverlay";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-stack">
        <div className="panel loading-panel">
          <div className="spinner" />
          <p>Checking session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-preview-shell">
        <div className="auth-preview-content blurred-preview">
          {children}
        </div>
        <LoginOverlay />
      </div>
    );
  }

  return <>{children}</>;
}