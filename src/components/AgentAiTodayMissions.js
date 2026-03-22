/**
 * @param {{
 *   id: string,
 *   title: string,
 *   hint: string,
 *   linkedSkills?: { id: string, name: string }[],
 * }[]} missions
 * @param {Record<string, boolean>} picked
 * @param {(id: string) => void} onToggle
 * @param {() => void} onApply
 * @param {boolean} [embedded]
 */
export default function AgentAiTodayMissions({
  missions,
  picked,
  onToggle,
  onApply,
  embedded = false,
}) {
  const nPicked = missions.filter((m) => picked[m.id]).length;
  const TitleTag = embedded ? 'h3' : 'h2';

  return (
    <section
      className={
        embedded
          ? 'agent-mission-today agent-mission-today--embedded'
          : 'agent-mission-today'
      }
      aria-labelledby="agent-mission-heading"
    >
      <div className="agent-mission-today__inner">
        <header
          className={
            embedded
              ? 'agent-mission-today__head agent-mission-today__head--with-cta'
              : 'agent-mission-today__head'
          }
        >
          <div className="agent-mission-today__head-main">
            <p className="agent-mission-today__eyebrow">하루 실천 과제</p>
            <TitleTag
              id="agent-mission-heading"
              className="agent-mission-today__title"
            >
              오늘의 미션
            </TitleTag>
            <p className="agent-mission-today__lead">
              미션마다 스킬트리 스킬을 <strong>여러 개</strong> 연결할 수 있으며, 깨면 연결된
              스킬이 함께 성장합니다. 원하는 항목만 선택하거나, 선택 없이도 우수사례 신청을
              진행할 수 있습니다.
            </p>
          </div>
          {embedded ? (
            <button
              type="button"
              className="btn-register-hero agent-mission-today__cta agent-mission-today__cta--header"
              onClick={onApply}
            >
              우수사례 신청
            </button>
          ) : null}
        </header>

        <ul className="agent-mission-today__list">
          {missions.map((m, index) => {
            const on = Boolean(picked[m.id]);
            return (
              <li key={m.id} className="agent-mission-today__item">
                <label
                  className={`agent-mission-card${on ? ' agent-mission-card--on' : ''}`}
                >
                  <input
                    type="checkbox"
                    className="agent-mission-card__input"
                    checked={on}
                    onChange={() => onToggle(m.id)}
                  />
                  <span className="agent-mission-card__check" aria-hidden="true">
                    <svg viewBox="0 0 16 16" width="11" height="11" fill="none">
                      <path
                        d="M3 8.5l3 3 7-7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="agent-mission-card__body">
                    <span className="agent-mission-card__index" aria-hidden="true">
                      {index + 1}
                    </span>
                    <span className="agent-mission-card__text">
                      <span className="agent-mission-card__title">{m.title}</span>
                      <span className="agent-mission-card__hint">{m.hint}</span>
                      {m.linkedSkills?.length ? (
                        <span
                          className="agent-mission-skill-pill-wrap"
                          title="스킬트리와 연결된 스킬"
                        >
                          {m.linkedSkills.map((s) => (
                            <span
                              key={s.id}
                              className={`agent-mission-skill-pill${on ? ' agent-mission-skill-pill--on' : ''}`}
                            >
                              {s.name}
                            </span>
                          ))}
                        </span>
                      ) : null}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>

        <footer className="agent-mission-today__foot">
          <p className="agent-mission-today__meta">
            {nPicked > 0 ? (
              <>
                선택 <span className="agent-mission-today__meta-num">{nPicked}</span>건
                · 신청서에 포함 · 연결 스킬 성장에 반영
              </>
            ) : (
              <>미선택 · 자유 주제로 작성 가능</>
            )}
          </p>
          {!embedded ? (
            <button
              type="button"
              className="agent-mission-today__cta"
              onClick={onApply}
            >
              우수사례 신청
            </button>
          ) : null}
        </footer>
      </div>
    </section>
  );
}
