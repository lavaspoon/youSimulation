import { useState } from 'react';

const initial = { situation: '', reaction: '', action: '' };

const steps = [
  { key: 'form', label: '작성' },
  { key: 'preview', label: '확인' },
  { key: 'result', label: '완료' },
];

export default function ApplyExcellentModal({
  open,
  onClose,
  linkedMissions = [],
}) {
  const [form, setForm] = useState(initial);
  const [step, setStep] = useState('form');

  if (!open) return null;

  const stepIndex = steps.findIndex((s) => s.key === step);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const resetClose = () => {
    setForm(initial);
    setStep('form');
    onClose();
  };

  return (
    <div
      className="manager-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-register-title"
      onClick={handleOverlayClick}
    >
      <div
        className="apply-register-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="apply-register-header">
          <div>
            <h2 id="apply-register-title">우수사례 신청</h2>
            <p className="apply-register-sub">
              3문항 입력 · 제출 시 신청 포인트 +30P (승인 여부 무관)
            </p>
          </div>
          <button
            type="button"
            className="apply-register-close"
            onClick={resetClose}
            aria-label="닫기"
          >
            ×
          </button>
        </header>

        <div className="apply-register-steps" role="tablist" aria-label="신청 단계">
          {steps.map((s, i) => (
            <div
              key={s.key}
              className={`apply-register-step${
                i === stepIndex ? ' active' : ''
              }${i < stepIndex ? ' done' : ''}`}
              role="presentation"
            >
              {i + 1}. {s.label}
            </div>
          ))}
        </div>

        <div className="apply-register-body">
          {step === 'form' && (
            <form
              className="apply-form-clean"
              onSubmit={(e) => {
                e.preventDefault();
                setStep('preview');
              }}
            >
              {linkedMissions.length > 0 ? (
                <div className="apply-linked-missions">
                  <div className="apply-linked-missions-label">
                    연결된 미션
                  </div>
                  <ul className="apply-linked-missions-rows">
                    {linkedMissions.map((m) => (
                      <li key={m.id} className="apply-linked-missions-row">
                        <span className="apply-linked-missions-row__title">
                          {m.title}
                        </span>
                        {m.hint ? (
                          <span className="apply-linked-missions-row__hint">
                            {m.hint}
                          </span>
                        ) : null}
                        {m.linkedSkills?.length ? (
                          <div className="apply-linked-missions-row__skills">
                            {m.linkedSkills.map((s) => (
                              <span
                                key={s.id}
                                className="apply-linked-missions-row__skill"
                              >
                                {s.name}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="apply-linked-missions-none">
                  선택한 미션이 없습니다. 자유 주제로 작성하셔도 됩니다.
                </p>
              )}
              <div className="apply-field-clean">
                <label htmlFor="situation">어떤 상황이었나요?</label>
                <textarea
                  id="situation"
                  value={form.situation}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, situation: e.target.value }))
                  }
                  placeholder="고객 상황과 맥락을 간단히"
                  autoComplete="off"
                />
              </div>
              <div className="apply-field-clean">
                <label htmlFor="reaction">고객 반응은?</label>
                <textarea
                  id="reaction"
                  value={form.reaction}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, reaction: e.target.value }))
                  }
                  placeholder="감정·발화 요지"
                  autoComplete="off"
                />
              </div>
              <div className="apply-field-clean">
                <label htmlFor="action">내가 한 행동은?</label>
                <textarea
                  id="action"
                  value={form.action}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, action: e.target.value }))
                  }
                  placeholder="적용한 상담 기법·제안·후속 조치"
                  autoComplete="off"
                />
              </div>
              <div className="apply-register-actions">
                <button type="submit" className="btn-primary-action">
                  다음
                </button>
                <button
                  type="button"
                  className="btn-secondary-action"
                  onClick={resetClose}
                >
                  취소
                </button>
              </div>
            </form>
          )}

          {step === 'preview' && (
            <>
              {linkedMissions.length > 0 ? (
                <div className="apply-linked-missions">
                  <div className="apply-linked-missions-label">연결된 미션</div>
                  <ul className="apply-linked-missions-rows">
                    {linkedMissions.map((m) => (
                      <li key={m.id} className="apply-linked-missions-row">
                        <span className="apply-linked-missions-row__title">
                          {m.title}
                        </span>
                        {m.hint ? (
                          <span className="apply-linked-missions-row__hint">
                            {m.hint}
                          </span>
                        ) : null}
                        {m.linkedSkills?.length ? (
                          <div className="apply-linked-missions-row__skills">
                            {m.linkedSkills.map((s) => (
                              <span
                                key={s.id}
                                className="apply-linked-missions-row__skill"
                              >
                                {s.name}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className="apply-preview-clean">
                <strong>신청 사유 초안</strong>
                <p className="apply-preview-clean__body">
                  <span className="apply-preview-clean__flow">
                    {form.situation || '…'}
                    <span className="apply-preview-clean__sep"> → </span>
                    {form.reaction || '…'}
                    <span className="apply-preview-clean__sep"> — </span>
                    {form.action || '…'}
                  </span>
                  <span className="apply-preview-clean__suffix">
                    을 바탕으로 문제를 완화하고 신뢰를 회복했습니다.
                  </span>
                </p>
              </div>
              <div className="apply-register-actions">
                <button
                  type="button"
                  className="btn-primary-action"
                  onClick={() => setStep('result')}
                >
                  제출
                </button>
                <button
                  type="button"
                  className="btn-secondary-action"
                  onClick={() => setStep('form')}
                >
                  수정
                </button>
              </div>
            </>
          )}

          {step === 'result' && (
            <div className="apply-form-clean">
              <p className="apply-result-line">
                접수 완료. 신청 포인트 +30P가 적립됩니다.
              </p>
              <div className="apply-result-score">
                <span className="apply-result-score-value">78</span>
                <span className="apply-result-score-unit">사전 점수</span>
              </div>
              <div className="apply-result-meta">
                <div className="apply-result-meta-item">
                  <div className="apply-result-meta-label">적립</div>
                  <div className="apply-result-meta-value">+30P</div>
                </div>
              </div>
              <div className="apply-keyword-row">
                <div className="apply-result-meta-label">감지 키워드</div>
                <div className="keyword-tags" style={{ marginTop: 0 }}>
                  {['공감', '경청', '해지방어', '묶음상품'].map((k) => (
                    <span key={k} className="keyword-tag">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
              <div className="apply-register-actions">
                <button
                  type="button"
                  className="btn-primary-action"
                  onClick={resetClose}
                >
                  닫기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
