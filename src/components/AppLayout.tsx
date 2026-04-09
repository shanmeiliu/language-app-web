import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function formatAccountType(type: string) {
  if (type === "google") return "Google";
  if (type === "local") return "Password";
  if (type === "anonymous") return "Guest";
  return type;
}

// 👇 helper to get initials
function getInitials(username: string) {
  if (!username) return "?";

  const parts = username.split("_");
  if (parts.length > 1) {
    return parts[1][0]?.toUpperCase() || "?";
  }

  return username.slice(0, 1).toUpperCase();
}

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  function isActive(path: string) {
    return location.pathname === path;
  }

  async function handleLogout() {
    try {
      await fetch("http://127.0.0.1:8000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      navigate("/login");
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Language Learning App</p>
          <h1 className="app-title">AI Flashcards</h1>
        </div>

        <div className="topbar-right">
          <div className="tab-row">
            <Link
              to="/"
              className={isActive("/") ? "tab-button active" : "tab-button"}
            >
              Phrase
            </Link>

            <Link
              to="/topic"
              className={isActive("/topic") ? "tab-button active" : "tab-button"}
            >
              Topic
            </Link>

            <Link
              to="/game"
              className={isActive("/game") ? "tab-button active" : "tab-button"}
            >
              Challenge
            </Link>
          </div>

          <div className="user-bar">
            {loading ? (
              <span className="user-meta muted">Loading user...</span>
            ) : user ? (
              <>
                <div className="user-profile">
                  <div className="avatar-circle">
                    {getInitials(user.username)}
                  </div>

                  <div className="user-info">
                    <span className="user-name">{user.username}</span>
                    <span className="user-meta">
                      {formatAccountType(user.account_type)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                type="button"
                className="secondary-button"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}