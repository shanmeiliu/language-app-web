export default function PreviewFlashcards() {
  return (
    <div className="preview-grid">
      <div className="preview-card">
        <div className="preview-label">Phrase</div>
        <div className="preview-source">守株待兔</div>
        <div className="preview-target">Wait for luck instead of acting</div>
      </div>

      <div className="preview-card">
        <div className="preview-label">Topic</div>
        <div className="preview-source">Travel</div>
        <div className="preview-target">Common airport vocabulary</div>
      </div>

      <div className="preview-card">
        <div className="preview-label">Challenge</div>
        <div className="preview-options">
          <div className="preview-option correct">
            To wait for a windfall
          </div>
          <div className="preview-option">To work hard daily</div>
          <div className="preview-option">To hunt animals</div>
          <div className="preview-option">To plan carefully</div>
        </div>
      </div>
    </div>
  );
}