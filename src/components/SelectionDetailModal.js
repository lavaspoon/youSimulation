export default function SelectionDetailModal({ open, onClose, record }) {
  if (!open || !record) return null;

  const isSelected = record.status === 'selected';

  return (
    <div
      className="manager-modal-overlay selection-detail-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="selection-detail-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="apply-register-modal selection-detail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="apply-register-header selection-detail-header">
          <div className="selection-detail-header__main">
            <h2 id="selection-detail-title" className="selection-detail-title">
              상세 내역
            </h2>
            {record.titleShort ? (
              <p className="selection-detail-case-title">{record.titleShort}</p>
            ) : null}
            <p className="selection-detail-meta-row">
              <span className="selection-detail-meta-item">{record.date}</span>
              <span className="selection-detail-meta-dot" aria-hidden="true">
                ·
              </span>
              <span className="selection-detail-meta-item">{record.product}</span>
              <span
                className={
                  isSelected
                    ? 'selection-status-badge selection-status-badge--on'
                    : 'selection-status-badge selection-status-badge--off'
                }
              >
                {isSelected ? '선정' : '미선정'}
              </span>
            </p>
          </div>
          <button
            type="button"
            className="apply-register-close selection-detail-close"
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </header>

        <div className="selection-detail-body">
          <section className="selection-detail-card">
            <h3 className="selection-detail-card__title">등록하신 정보</h3>
            <div className="selection-detail-stack">
              <div className="selection-detail-field">
                <span className="selection-detail-field__label">상황</span>
                <p className="selection-detail-field__text">
                  {record.registered.situation}
                </p>
              </div>
              <div className="selection-detail-field">
                <span className="selection-detail-field__label">고객 반응</span>
                <p className="selection-detail-field__text">
                  {record.registered.reaction}
                </p>
              </div>
              <div className="selection-detail-field">
                <span className="selection-detail-field__label">상담 행동</span>
                <p className="selection-detail-field__text">
                  {record.registered.action}
                </p>
              </div>
            </div>
          </section>

          {isSelected && record.whySelected ? (
            <section className="selection-detail-card selection-detail-card--reason selection-detail-card--reason-positive">
              <h3 className="selection-detail-card__title selection-detail-card__title--accent">
                선정 사유
              </h3>
              <p className="selection-detail-reason-text">{record.whySelected}</p>
            </section>
          ) : null}

          {!isSelected && record.whyNotSelected ? (
            <section className="selection-detail-card selection-detail-card--reason selection-detail-card--reason-neutral">
              <h3 className="selection-detail-card__title">미선정 사유</h3>
              <p className="selection-detail-reason-text selection-detail-reason-text--muted">
                {record.whyNotSelected}
              </p>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
