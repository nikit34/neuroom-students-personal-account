import { useEffect, useMemo, useRef, useState } from 'react';

const statusMap = {
  new: { label: 'Новое', className: 'status status--new' },
  review: { label: 'На проверке', className: 'status status--review' },
  done: { label: 'Есть разбор', className: 'status status--done' }
};

const errors = [
  {
    id: 1,
    title: 'НЕ с глаголами',
    wrong: 'неладилось',
    correct: 'не ладилось',
    reason: 'НЕ с глаголами пишется раздельно.',
    tip: 'Сделай 2 мини-примера и проговори правило вслух.'
  },
  {
    id: 2,
    title: 'Пропущен предлог',
    wrong: 'у него',
    correct: 'у него было',
    reason: 'Пропуск слова меняет смысл предложения.',
    tip: 'При списывании веди пальцем по строке.'
  },
  {
    id: 3,
    title: 'Прямая речь',
    wrong: 'Она сказала что, «…»',
    correct: 'Она сказала: «…»',
    reason: 'После слов автора перед прямой речью ставится двоеточие.',
    tip: 'Повтори правило №36 и сделай 1 короткий пример.'
  }
];

function StatusPill({ status }) {
  const { label, className } = statusMap[status] || statusMap.new;
  return <span className={className}>{label}</span>;
}

export default function App() {
  const MAX_FILES = 6;
  const LEVEL_DATA = {
    currentLevel: 'Уровень 3',
    nextLevel: 'Уровень 4',
    currentXp: 5734,
    targetXp: 6300,
    streakDays: 7
  };
  const [view, setView] = useState('home');
  const [files, setFiles] = useState([]);
  const [assignmentStatus, setAssignmentStatus] = useState('new');
  const [toast, setToast] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [version, setVersion] = useState(1);
  const [shareLink, setShareLink] = useState('');
  const [shareVersion, setShareVersion] = useState(null);
  const [approvedVersion, setApprovedVersion] = useState(null);
  const [includeGradeInFriendShare, setIncludeGradeInFriendShare] = useState(false);
  const [friendShareTokenBefore] = useState(() => Math.random().toString(36).slice(2, 8));
  const [friendShareTokenAfter] = useState(() => Math.random().toString(36).slice(2, 8));
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files]
  );

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const appendFiles = (selectedFiles) => {
    if (!selectedFiles.length) return;

    setFiles((prev) => {
      const remainingSlots = Math.max(0, MAX_FILES - prev.length);
      if (remainingSlots === 0) {
        setToast(`Можно добавить не больше ${MAX_FILES} фото.`);
        return prev;
      }

      const toAdd = selectedFiles.slice(0, remainingSlots);
      if (!toAdd.length) return prev;

      const hadFilesBefore = prev.length > 0;
      setVersion((currentVersion) => (hadFilesBefore ? currentVersion + 1 : 1));
      return [...prev, ...toAdd];
    });
  };

  const handleCameraCapture = (event) => {
    const selected = Array.from(event.target.files || []);
    appendFiles(selected);
    event.target.value = '';
  };

  const handleGallerySelect = (event) => {
    const selected = Array.from(event.target.files || []);
    appendFiles(selected);
    event.target.value = '';
  };

  const handleClearPhotos = () => {
    setFiles([]);
    setVersion(1);
    setToast('Фото очищены. Можно снять заново.');
  };

  const handleSubmit = () => {
    setAssignmentStatus('review');
    setToast('Решение отправлено учителю. Скоро придет разбор.');
  };

  const openView = (nextView) => {
    setView(nextView);
    setShowMore(false);
  };

  const createParentLink = (targetVersion) => {
    const params = new URLSearchParams({
      for: 'parent',
      v: String(targetVersion),
      token: Math.random().toString(36).slice(2, 8)
    });
    return `https://neuroom.pw/share/homework/416?${params.toString()}`;
  };

  const getCurrentParentLink = () => {
    if (hasShare && shareIsCurrent) {
      return shareLink;
    }
    const link = createParentLink(version);
    setShareLink(link);
    setShareVersion(version);
    return link;
  };

  const copyText = async (value, successMessage) => {
    try {
      await navigator.clipboard.writeText(value);
      setToast(successMessage);
    } catch {
      setToast('Не получилось скопировать ссылку.');
    }
  };

  const openTelegramShare = (link, text) => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`;
    window.open(telegramUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShare = () => {
    const link = getCurrentParentLink();
    setToast('Ссылка создана. Можно отправить родителю.');
    return link;
  };

  const handleCopyParentLink = async () => {
    const link = getCurrentParentLink();
    await copyText(link, 'Ссылка для родителя скопирована.');
  };

  const handleTelegramParentShare = () => {
    const link = getCurrentParentLink();
    openTelegramShare(link, `Проверь, пожалуйста, моё ДЗ. Версия v${version}.`);
    setToast('Открыт Telegram для отправки родителю.');
  };

  const handleApprove = () => {
    setApprovedVersion(version);
    setToast(`Родитель одобрил версию v${version}.`);
  };

  const hasShare = shareVersion !== null;
  const shareIsCurrent = shareVersion === version;
  const hasApproval = approvedVersion !== null;
  const approvalIsCurrent = approvedVersion === version;
  const levelPercent = Math.min(
    100,
    Math.round((LEVEL_DATA.currentXp / LEVEL_DATA.targetXp) * 100)
  );
  const levelProgressDeg = Math.round((levelPercent / 100) * 360);
  const xpRemaining = Math.max(LEVEL_DATA.targetXp - LEVEL_DATA.currentXp, 0);
  const friendShareBeforeLink = useMemo(() => {
    const params = new URLSearchParams({
      for: 'friend',
      phase: 'before',
      grade: '0',
      token: friendShareTokenBefore
    });
    return `https://neuroom.pw/share/homework/416?${params.toString()}`;
  }, [friendShareTokenBefore]);

  const friendShareAfterLink = useMemo(() => {
    const params = new URLSearchParams({
      for: 'friend',
      phase: 'after',
      grade: includeGradeInFriendShare ? '1' : '0',
      token: friendShareTokenAfter
    });
    return `https://neuroom.pw/share/homework/1502?${params.toString()}`;
  }, [friendShareTokenAfter, includeGradeInFriendShare]);

  const friendShareAfterSummary = useMemo(
    () => (includeGradeInFriendShare ? 'с оценкой' : 'без оценки'),
    [includeGradeInFriendShare]
  );

  const handleCopyFriendBeforeLink = async () => {
    await copyText(friendShareBeforeLink, 'Ссылка для друга (до проверки) скопирована.');
  };

  const handleTelegramFriendBeforeShare = () => {
    openTelegramShare(
      friendShareBeforeLink,
      'Смотри, я решил ДЗ. Зацени до проверки.'
    );
    setToast('Открыт Telegram для отправки другу.');
  };

  const handleCopyFriendAfterLink = async () => {
    await copyText(friendShareAfterLink, 'Ссылка для друга (после проверки) скопирована.');
  };

  const handleTelegramFriendAfterShare = () => {
    openTelegramShare(
      friendShareAfterLink,
      `Смотри, как я решил ДЗ (${friendShareAfterSummary}).`
    );
    setToast('Открыт Telegram для отправки другу.');
  };

  return (
    <div className="page">
      <div className="ambient">
        <span className="blob blob--one"></span>
        <span className="blob blob--two"></span>
        <span className="blob blob--three"></span>
      </div>

      <div className="app">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark">N</div>
            <div>
              <div className="brand-title">Neuroom</div>
              <div className="brand-sub">кабинет ученика</div>
            </div>
          </div>

          <div className="student-card">
            <div className="avatar">HG</div>
            <div>
              <div className="student-name">Гермиона Г.</div>
              <div className="student-meta">5Б • лицей №12</div>
            </div>
          </div>

          <div className="nav-block">
            <div className="nav-label">Основное</div>
            <button
              className={`nav-link ${view === 'home' ? 'is-active' : ''}`}
              onClick={() => openView('home')}
            >
              Главная
            </button>
            <button
              className={`nav-link ${view === 'assignment' ? 'is-active' : ''}`}
              onClick={() => openView('assignment')}
            >
              Сдать ДЗ
            </button>
          </div>

          <div className="sidebar-card">
            <div className="sidebar-title">Мой темп</div>
            <div className="sidebar-value">7 дней подряд</div>
            <div className="sidebar-note">До значка «Супер-старт» остался 1 день</div>
          </div>
        </aside>

        <main className="content">
          <header className="topbar">
            <div className="topbar-left">
              <div className="date-chip">10 февраля 2026</div>
              <div className="weather-chip">Сегодня: чистый лист, без долгов</div>
              <div className="mobile-student">Гермиона • 5Б</div>
            </div>
            <div className="topbar-right">
              <div className="more-wrapper">
                <button className="btn btn--quiet" onClick={() => setShowMore((prev) => !prev)}>
                  Ещё
                </button>
                {showMore && (
                  <div className="more-menu">
                    <button className="btn btn--ghost" onClick={() => openView('feedback')}>
                      Обратная связь
                    </button>
                    <button className="btn btn--ghost" onClick={() => openView('profile')}>
                      Профиль
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {view === 'home' && (
            <section className="view">
              <div className="section">
                <div className="cta-panel">
                  <div>
                    <div className="cta-title">Сдать домашнее задание</div>
                    <div className="cta-note">Самый быстрый путь к разбору от учителя</div>
                  </div>
                  <div className="cta-actions">
                    <button
                      className="btn btn--primary btn--submit-main"
                      onClick={() => openView('assignment')}
                    >
                      Сдать ДЗ
                    </button>
                    <div className="cta-links">
                      <button className="btn btn--text">Написать учителю</button>
                      <button className="btn btn--text">Задать вопрос</button>
                    </div>
                  </div>
                </div>

                <div className="section-head">
                  <div>
                    <div className="section-title">Сейчас важно</div>
                    <div className="section-note">Новое задание и твой прогресс</div>
                  </div>
                </div>

                <div className="hero">
                  <div className="hero-card">
                    <div className="hero-tag">Новое задание</div>
                    <h1>Привет, Гермиона!</h1>
                    <p>
                      Учитель прислал ДЗ по русскому. Сделай фото, мы проверим и вернем
                      подробный разбор ошибок с подсказками.
                    </p>
                  </div>
                  <div className="hero-side">
                    <div className="level-header">
                      <div className="level-kicker">Твой прогресс</div>
                      <div className="level-route">{LEVEL_DATA.currentLevel} → {LEVEL_DATA.nextLevel}</div>
                    </div>
                    <div className="level-main">
                      <div
                        className="progress-ring"
                        style={{
                          background: `conic-gradient(var(--accent-2) 0 ${levelProgressDeg}deg, #e9f4f4 ${levelProgressDeg}deg 360deg)`
                        }}
                      >
                        <div className="progress-ring__icon" aria-hidden="true">
                          <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
                            <polygon points="6,58 24,34 42,58" fill="#9aa0a6" />
                            <polygon points="18,58 40,16 66,58" fill="#d1d5db" />
                            <polygon points="34,28 40,16 46,28" fill="#f8fafc" />
                            <polygon points="26,58 40,34 56,58" fill="#6b7280" opacity="0.55" />
                            <path d="M5 58C15 49 20 62 30 54C39 47 43 64 52 56C60 49 64 60 68 58V66H5V58Z" fill="#22c55e" />
                            <line x1="40" y1="16" x2="40" y2="7" stroke="#94a3b8" strokeWidth="2" />
                            <polygon points="40,8 50,12 40,16" fill="#ef4444" />
                          </svg>
                        </div>
                      </div>
                      <div className="level-details">
                        <div className="level-xp">{LEVEL_DATA.currentXp} / {LEVEL_DATA.targetXp} XP</div>
                        <div className="level-progress">Прогресс уровня: {levelPercent}%</div>
                        <div className="level-note">Осталось {xpRemaining} XP до следующего уровня</div>
                        <div className="level-streak">Серия: {LEVEL_DATA.streakDays} дней без пропусков</div>
                      </div>
                    </div>
                    <div className="xp-sources">
                      <span className="xp-chip">+120 за сдачу ДЗ</span>
                      <span className="xp-chip">+80 за просмотр разбора</span>
                      <span className="xp-chip">+150 за квиз AI‑репетитора</span>
                    </div>
                  </div>
                </div>

                <div className="flow-steps">
                  <div className="flow-step is-current">
                    <div className="flow-title">1. Сдать ДЗ</div>
                    <div className="flow-note">1–3 фото, без бликов</div>
                  </div>
                  <div className="flow-step is-ready">
                    <div className="flow-title">2. Посмотреть разбор</div>
                    <div className="flow-note">Главное — обратная связь. Разбор уже готов.</div>
                  </div>
                  <div className="flow-step">
                    <div className="flow-title">3. Закрепить тему</div>
                    <div className="flow-note">Мини‑квизы → ачивка</div>
                  </div>
                </div>
              </div>

              <div className="section">
                <div className="section-head">
                  <div>
                    <div className="section-title">Задания</div>
                    <div className="section-note">Что в работе и что уже проверено</div>
                  </div>
                  <button className="btn btn--ghost btn--small" onClick={() => openView('history')}>
                    Прошлые ДЗ
                  </button>
                </div>

                <div className="grid grid--three">
                  <div className="card card--accent">
                    <div className="card-header">
                      <span className="subject">Русский язык</span>
                      <StatusPill status={assignmentStatus} />
                    </div>
                    <div className="card-title">Упр. 416, стр. 9–10</div>
                    <p className="card-text">
                      Списать текст, раскрывая скобки. Вставить пропущенные буквы и знаки.
                    </p>
                    <div className="card-meta">
                      <span>Сдать до 14.02</span>
                      <span>~20 минут</span>
                    </div>
                    <button className="btn btn--primary" onClick={() => openView('assignment')}>
                      Сдать ДЗ
                    </button>
                  </div>

                  <div className="card">
                    <div className="card-header">
                      <span className="subject">Математика</span>
                      <StatusPill status="review" />
                    </div>
                    <div className="card-title">Задачи 3, 4, 5</div>
                    <p className="card-text">Фото отправлены вчера в 19:40</p>
                    <div className="card-meta">
                      <span>Ответ учителя до 11.02</span>
                    </div>
                    <button className="btn btn--ghost">Посмотреть отправку</button>
                  </div>

                  <div className="card">
                    <div className="card-header">
                      <span className="subject">Русский язык</span>
                      <StatusPill status="done" />
                    </div>
                    <div className="card-title">Диктант, 21.01</div>
                    <p className="card-text">Оценка 4 и подробный разбор ошибок с подсказками.</p>
                    <div className="card-meta">
                      <span>Ошибки: 3</span>
                      <span>Сильная сторона: пунктуация</span>
                    </div>
                    <button className="btn btn--primary" onClick={() => openView('feedback')}>
                      Открыть разбор
                    </button>
                  </div>
                </div>
              </div>

              <div className="section">
                <div className="section-head">
                  <div>
                    <div className="section-title">План и поддержка</div>
                    <div className="section-note">Помогаем пройти путь шаг за шагом</div>
                  </div>
                </div>

                <div className="grid grid--two">
                  <div className="card">
                    <div className="card-title">План на сегодня</div>
                    <ul className="checklist">
                      <li>Сделать фото ДЗ по русскому</li>
                      <li>Проверить, что все страницы видны</li>
                      <li>Отправить на проверку</li>
                      <li>Прочитать прошлый разбор ошибок</li>
                    </ul>
                  </div>
                  <div className="card">
                    <div className="card-title">Поддержка от учителя</div>
                    <div className="note">
                      <div className="note-title">Совет дня</div>
                      <p>Если сомневаешься в правиле, отметь этот номер красным на фото — учитель увидит.</p>
                    </div>
                    <div className="note">
                      <div className="note-title">Бонус</div>
                      <p>За фото без бликов начислим +1 звездочку к рейтингу внимательности.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {view === 'assignment' && (
            <section className="view">
              <div className="page-header">
                <button className="btn btn--back" onClick={() => openView('home')}>
                  ← На главную
                </button>
                <div>
                  <div className="page-title">Русский язык · Домашнее задание</div>
                  <div className="page-sub">Задание от 10.02.2026</div>
                </div>
                <StatusPill status={assignmentStatus} />
              </div>

                <div className="grid grid--two">
                  <div className="card">
                    <div className="card-title">Задание от учителя</div>
                    <p className="card-text">
                      Упр. 416 (стр. 9–10). Озаглавить текст. Списать, раскрывая скобки,
                    вставить пропущенные буквы и знаки препинания. Подчеркнуть грамматические основы.
                  </p>
                  <div className="card-meta">
                    <span>Срок сдачи: 14.02</span>
                    <span>Обычно: 2–3 страницы</span>
                  </div>
                  <div className="teacher-note">
                    <strong>Подсказка:</strong> сначала выдели грамматические основы, потом проверь знаки.
                  </div>
                  </div>

                  <div className="card">
                    <div className="card-title">Сделай фото решения</div>
                    <div className="capture-panel">
                      <input
                        ref={cameraInputRef}
                        className="upload-input"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleCameraCapture}
                      />
                      <input
                        ref={galleryInputRef}
                        className="upload-input"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGallerySelect}
                      />
                      <button
                        className="btn btn--primary capture-btn"
                        onClick={() => cameraInputRef.current?.click()}
                      >
                        Сделать фото
                      </button>
                      <div className="capture-subactions">
                        <button
                          className="btn btn--ghost btn--small"
                          onClick={() => galleryInputRef.current?.click()}
                        >
                          Из галереи
                        </button>
                        <button
                          className="btn btn--quiet btn--small"
                          onClick={handleClearPhotos}
                        >
                          Очистить
                        </button>
                      </div>
                      <div className="upload-hint">До {MAX_FILES} фото. Снимай страницы по порядку.</div>
                    </div>

                  {files.length === 0 ? (
                    <div className="upload-empty">Фото пока не добавлены</div>
                  ) : (
                    <div className="upload-previews">
                      {previews.map((preview) => (
                        <div className="upload-item" key={preview.url}>
                          <img src={preview.url} alt={preview.file.name} />
                          <span>{preview.file.name.length > 22 ? `${preview.file.name.slice(0, 22)}…` : preview.file.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                    <div className="upload-actions">
                      <button className="btn btn--primary" onClick={handleSubmit}>
                        Отправить учителю
                      </button>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-title">Поделиться с родителем (необязательно)</div>
                  <div className="approval-row">
                    <div>
                      <div className="approval-title">Текущая версия решения</div>
                      <div className="approval-meta">v{version} · {files.length || 0} фото</div>
                    </div>
                    <div className="share-actions">
                      <button className="btn btn--ghost" onClick={handleShare}>
                        Создать ссылку
                      </button>
                      <button className="btn btn--ghost" onClick={handleCopyParentLink}>
                        Копировать
                      </button>
                      <button className="btn btn--telegram" onClick={handleTelegramParentShare}>
                        Telegram
                      </button>
                    </div>
                  </div>
                  {hasShare && (
                    <div className="approval-box">
                      <div className="approval-status">
                        {shareIsCurrent ? 'Ссылка актуальна' : 'Ссылка на прошлую версию'}
                      </div>
                      <div className="approval-link">{shareLink}</div>
                      <div className="approval-note">
                        {shareIsCurrent
                          ? 'Отправь ссылку родителю в Telegram или мессенджер.'
                          : `Ссылка была создана для версии v${shareVersion}. Чтобы родитель видел актуальную работу, создай новую.`}
                      </div>
                    </div>
                  )}
                  <div className="approval-row approval-row--compact">
                    <div>
                      <div className="approval-title">Одобрение родителя</div>
                      <div className="approval-meta">
                        {!hasApproval && 'Пока не одобрено'}
                        {hasApproval && approvalIsCurrent && `Одобрено для версии v${approvedVersion}`}
                        {hasApproval && !approvalIsCurrent && `Одобрено для версии v${approvedVersion}, текущая v${version}`}
                      </div>
                    </div>
                    <button className="btn btn--quiet" onClick={handleApprove}>
                      Родитель одобрил
                    </button>
                  </div>
                  <div className="approval-footnote">
                    Одобрение фиксируется за версией. После любых правок нужна новая ссылка.
                  </div>
                  {hasApproval && !approvalIsCurrent && (
                    <div className="approval-warning">
                      Родитель одобрил другую версию. Если ты что-то дописал — отправь новую ссылку.
                    </div>
                  )}
                </div>

                <div className="card share-card">
                  <div>
                    <div className="card-title">Поделиться с другом до проверки</div>
                    <p className="card-text">
                      Отправь другу черновик решения. Здесь всегда без оценки, потому что проверка еще не завершена.
                    </p>
                  </div>
                  <div className="share-stage">Режим: до проверки</div>
                  <div className="share-link">{friendShareBeforeLink}</div>
                  <div className="share-actions">
                    <button className="btn btn--ghost" onClick={handleCopyFriendBeforeLink}>
                      Копировать ссылку
                    </button>
                    <button className="btn btn--telegram" onClick={handleTelegramFriendBeforeShare}>
                      Отправить в Telegram
                    </button>
                  </div>
                </div>

                <div className="card">
                  <div className="card-title">Проверь перед отправкой</div>
                <div className="grid grid--three">
                  <div className="check-card">
                    <div className="check-title">Вся страница в кадре</div>
                    <div className="check-note">Не обрезай поля и номера заданий.</div>
                  </div>
                  <div className="check-card">
                    <div className="check-title">Четко видно ручку</div>
                    <div className="check-note">Избегай теней и бликов от лампы.</div>
                  </div>
                  <div className="check-card">
                    <div className="check-title">Порядок страниц</div>
                    <div className="check-note">Фото идут по порядку, без пропусков.</div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {view === 'feedback' && (
            <section className="view">
              <div className="page-header">
                <button className="btn btn--back" onClick={() => openView('home')}>
                  ← На главную
                </button>
                <div>
                  <div className="page-title">Оценка и обратная связь</div>
                  <div className="page-sub">Русский язык · 21.01.2026</div>
                </div>
                <StatusPill status="done" />
              </div>

              <div className="feedback-hero">
                <div className="score-summary">
                  <div className="score-eyebrow">Главное — обратная связь, не отметка</div>
                  <h2>Молодец, что справился с объемным текстом!</h2>
                  <p>
                    Обрати внимание на правило написания НЕ с глаголами — это самая серьезная ошибка в работе.
                    Также старайся не пропускать маленькие слова при списывании.
                  </p>
                  <div className="tag-row">
                    <span className="tag">Ошибки: 3</span>
                    <span className="tag">Сильная сторона: пунктуация</span>
                    <span className="tag">Рекомендация: повторить тему</span>
                  </div>
                  <div className="next-step">
                    <div>
                      <div className="next-title">Следующий шаг</div>
                      <div className="next-note">
                        Параллельный путь: мини‑квизы от простого к сложному. Домашка закроется по дедлайну.
                      </div>
                    </div>
                    <button className="btn btn--primary">Перейти к AI‑репетитору</button>
                  </div>
                </div>
                <div className="score-card score-card--mini">
                  <div className="score">4</div>
                  <div className="score-label">Оценка</div>
                </div>
              </div>

              <div className="grid grid--two">
                <div className="card">
                  <div className="card-title">Разбор ошибок</div>
                  {errors.map((error) => (
                    <div className="error-card" key={error.id}>
                      <div className="error-title">
                        {error.id}. {error.title}
                      </div>
                      <div className="error-compare">
                        <div>
                          <div className="error-label">В твоем ответе</div>
                          <div className="error-value">{error.wrong}</div>
                        </div>
                        <div>
                          <div className="error-label">Как правильно</div>
                          <div className="error-value">{error.correct}</div>
                        </div>
                      </div>
                      <div className="error-note">Почему это ошибка: {error.reason}</div>
                      <div className="error-tip">Подсказка: {error.tip}</div>
                    </div>
                  ))}
                  <button className="btn btn--ghost">Закрепить тему с AI‑репетитором</button>
                </div>

                <div className="card">
                  <div className="card-title">Фото с пометками</div>
                  <div className="paper">
                    <div className="paper-header">
                      <span>Страница 1</span>
                      <span className="status status--review">Ошибок: 3</span>
                    </div>
                    <div className="paper-body">
                      <div className="marker marker--one">1</div>
                      <div className="marker marker--two">2</div>
                      <div className="marker marker--three">3</div>
                    </div>
                  </div>
                  <div className="legend">
                    <div className="legend-item"><span className="legend-dot">1</span> НЕ с глаголами</div>
                    <div className="legend-item"><span className="legend-dot">2</span> Пропущен предлог</div>
                    <div className="legend-item"><span className="legend-dot">3</span> Прямая речь</div>
                  </div>
                  <button className="btn btn--ghost">Скачать фото с пометками</button>
                </div>
              </div>

              <div className="card share-card">
                <div>
                  <div className="card-title">Поделиться с другом после проверки</div>
                  <p className="card-text">
                    Можно выбрать, показывать оценку или нет при формировании ссылки.
                  </p>
                </div>
                <div className="share-stage">Режим: после проверки</div>
                <div className="share-controls">
                  <label className="toggle-option">
                    <input
                      type="checkbox"
                      checked={includeGradeInFriendShare}
                      onChange={(event) => setIncludeGradeInFriendShare(event.target.checked)}
                    />
                    <span>Показывать оценку</span>
                  </label>
                </div>
                <div className="share-summary">Вариант ссылки: {friendShareAfterSummary}</div>
                <div className="share-link">{friendShareAfterLink}</div>
                <div className="share-actions">
                  <button className="btn btn--ghost" onClick={handleCopyFriendAfterLink}>
                    Копировать ссылку
                  </button>
                  <button className="btn btn--telegram" onClick={handleTelegramFriendAfterShare}>
                    Отправить в Telegram
                  </button>
                </div>
              </div>

              <div className="card ai-card">
                <div>
                  <div className="card-title">AI‑репетитор: улучшить результат</div>
                  <p className="card-text">
                    Параллельный путь: серия мини‑квизов по твоим ошибкам. Домашка для учителя закрывается
                    по дедлайну, а здесь ты закрепляешь тему и зарабатываешь ачивку.
                  </p>
                  <div className="quiz-track">
                    <div className="quiz-step is-done">Базовый уровень</div>
                    <div className="quiz-step">Средний уровень</div>
                    <div className="quiz-step">Сложный уровень</div>
                    <div className="quiz-badge">Ачивка: «Квадратные уравнения — done»</div>
                  </div>
                </div>
                <div className="ai-actions">
                  <button className="btn btn--primary">Начать тренировку</button>
                  <button className="btn btn--ghost">План исправлений</button>
                </div>
              </div>
            </section>
          )}

          {view === 'history' && (
            <section className="view">
              <div className="page-header">
                <button className="btn btn--back" onClick={() => openView('home')}>
                  ← На главную
                </button>
                <div>
                  <div className="page-title">Прошлые домашние задания</div>
                  <div className="page-sub">История сдач и оценок</div>
                </div>
                <span className="status status--done">Сданы</span>
              </div>

              <div className="grid grid--two">
                <div className="card">
                  <div className="card-header">
                    <span className="subject">Русский язык</span>
                    <span className="status status--done">Оценка 4</span>
                  </div>
                  <div className="card-title">Стр. 9–10, упр. 416</div>
                  <p className="card-text">Списать, раскрывая скобки. Озаглавить текст.</p>
                  <div className="card-meta">
                    <span>Сдано 21.01</span>
                    <span>Ошибки: 3</span>
                  </div>
                  <button className="btn btn--ghost" onClick={() => openView('feedback')}>
                    Открыть разбор
                  </button>
                </div>

                <div className="card">
                  <div className="card-header">
                    <span className="subject">Русский язык</span>
                    <span className="status status--done">Оценка 5</span>
                  </div>
                  <div className="card-title">Диктант, 18.01</div>
                  <p className="card-text">Заполнить пропуски, выделить основу предложения.</p>
                  <div className="card-meta">
                    <span>Сдано 18.01</span>
                    <span>Ошибки: 1</span>
                  </div>
                  <button className="btn btn--ghost">Посмотреть работу</button>
                </div>
              </div>
            </section>
          )}

          {view === 'profile' && (
            <section className="view">
              <div className="page-header">
                <button className="btn btn--back" onClick={() => openView('home')}>
                  ← На главную
                </button>
                <div>
                  <div className="page-title">Профиль ученика</div>
                  <div className="page-sub">Настройки и цели</div>
                </div>
              </div>

              <div className="grid grid--two">
                <div className="card">
                  <div className="card-title">Мои цели</div>
                  <div className="goal">
                    <div>
                      <div className="goal-title">Сдавать ДЗ вовремя</div>
                      <div className="goal-note">Минимум 4 раза в неделю</div>
                    </div>
                    <span className="status status--done">Выполнено 3/4</span>
                  </div>
                  <div className="goal">
                    <div>
                      <div className="goal-title">Разобрать тему «НЕ с глаголами»</div>
                      <div className="goal-note">2 коротких упражнения</div>
                    </div>
                    <span className="status status--new">В работе</span>
                  </div>
                </div>
                <div className="card">
                  <div className="card-title">Уведомления</div>
                  <div className="toggle">
                    <span>Напоминать о сроках</span>
                    <span className="toggle-pill">Вкл</span>
                  </div>
                  <div className="toggle">
                    <span>Присылать советы учителя</span>
                    <span className="toggle-pill">Вкл</span>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      <div className="mobile-dock">
        <button
          className={`dock-btn ${view === 'home' ? 'is-active' : ''}`}
          onClick={() => openView('home')}
        >
          Главная
        </button>
        <button
          className={`dock-btn ${view === 'assignment' ? 'is-active' : ''}`}
          onClick={() => openView('assignment')}
        >
          Сдать
        </button>
        <button
          className={`dock-btn ${view === 'history' ? 'is-active' : ''}`}
          onClick={() => openView('history')}
        >
          История
        </button>
        <div className="dock-item">
          <button className="dock-btn" onClick={() => setShowMore((prev) => !prev)}>
            Ещё
          </button>
          {showMore && (
            <div className="dock-menu">
              <button className="btn btn--ghost" onClick={() => openView('feedback')}>
                Обратная связь
              </button>
              <button className="btn btn--ghost" onClick={() => openView('profile')}>
                Профиль
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
    </div>
  );
}
