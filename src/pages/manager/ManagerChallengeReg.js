export default function ManagerChallengeReg() {
  return (
    <>
      <header className="manager-header">
        <div className="header-content">
          <div className="header-left">
            <h1>고객 도전 등록</h1>
            <p>가명 · 페르소나 · 실고객 정보 금지</p>
          </div>
        </div>
      </header>

      <div className="review-hint-banner review-hint-banner--compact">
        실고객 정보 입력 금지
      </div>

      <div className="apply-form-grid" style={{ maxWidth: 720 }}>
        <div className="apply-field">
          <label htmlFor="alias">가명</label>
          <textarea
            id="alias"
            rows={1}
            style={{ minHeight: 44 }}
            placeholder="예: 김OO"
          />
        </div>
        <div className="apply-field">
          <label htmlFor="persona">상황·페르소나</label>
          <textarea
            id="persona"
            placeholder="AI 시뮬레이션에 쓰일 배경 설명"
          />
        </div>
        <div className="primary-cta-row">
          <button type="button" className="btn-primary-action">
            미리보기
          </button>
          <button type="button" className="btn-secondary-action">
            저장
          </button>
        </div>
      </div>
    </>
  );
}
