import { useEffect, useState } from "react";
import { getDashboardAttempts } from "../api/progress";

type DashboardAttempt = {
  attempt_id: string;
  flashcard_id: string;
  source_text: string | null;
  target_text: string | null;
  selected_option: string | null;
  correct_answer: string | null;
  is_correct: boolean | null;
  mode: string | null;
  shown_at: string;
  answered_at: string | null;
};

export default function DashboardPage() {
  const [attempts, setAttempts] = useState<DashboardAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const answered = attempts.filter((item) => item.answered_at);
  const correct = answered.filter((item) => item.is_correct);

  const accuracy =
    answered.length > 0 ? Math.round((correct.length / answered.length) * 100) : 0;

  useEffect(() => {
    getDashboardAttempts()
      .then(setAttempts)
      .catch((err) => {
        console.error(err);
        setError("Failed to load dashboard.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="panel loading-panel">
        <div className="spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <div className="panel">
        <p className="eyebrow">Dashboard</p>
        <h1>Your Learning Progress</h1>
        <p className="muted">
          Track cards shown, answers submitted, and your accuracy over time.
        </p>

        <div className="game-stats">
          <div className="stat-card">
            <span className="stat-label">Cards Seen</span>
            <span className="stat-value">{attempts.length}</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Answered</span>
            <span className="stat-value">{answered.length}</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Correct</span>
            <span className="stat-value">{correct.length}</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Accuracy</span>
            <span className="stat-value">{accuracy}%</span>
          </div>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="panel">
        <h2>Recent Cards</h2>

        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Shown At</th>
                <th>Mode</th>
                <th>Source</th>
                <th>Correct Answer</th>
                <th>Your Answer</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((item) => (
                <tr key={item.attempt_id}>
                  <td>{new Date(item.shown_at).toLocaleString()}</td>
                  <td>{item.mode || "-"}</td>
                  <td>{item.source_text || "-"}</td>
                  <td>{item.correct_answer || item.target_text || "-"}</td>
                  <td>{item.selected_option || "Not answered"}</td>
                  <td>
                    {item.is_correct === null
                      ? "Pending"
                      : item.is_correct
                        ? "Correct"
                        : "Wrong"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}