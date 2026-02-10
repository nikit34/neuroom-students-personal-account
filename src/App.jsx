import { useEffect, useMemo, useState } from 'react';

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
  const [view, setView] = useState('home');
  const [files, setFiles] = useState([]);
  const [assignmentStatus, setAssignmentStatus] = useState('new');
  const [toast, setToast] = useState('');
  const [showMore, setShowMore] = useState(false);

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

  const handleFiles = (event) => {
    const selected = Array.from(event.target.files || []).slice(0, 6);
    setFiles(selected);
  };

  const handleSubmit = () => {
    setAssignmentStatus('review');
    setToast('Фото отправлены. Учитель проверит работу и пришлет разбор.');
  };

  const openView = (nextView) => {
    setView(nextView);
    setShowMore(false);
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
                    <div className="progress-ring">
                      <div className="progress-ring__value">72%</div>
                    </div>
                    <div className="hero-side-title">Неделя без пропусков</div>
                    <div className="hero-side-note">Еще 1 задание и получишь новый уровень</div>
                  </div>
                </div>

                <div className="action-bar">
                  <div className="action-main">
                    <button className="btn btn--primary" onClick={() => openView('assignment')}>
                      Сдать ДЗ
                    </button>
                    <button className="btn btn--ghost" onClick={() => openView('history')}>
                      Прошлые ДЗ
                    </button>
                  </div>
                  <div className="action-secondary">
                    <button className="btn btn--quiet">Написать учителю</button>
                    <button className="btn btn--quiet">Задать вопрос</button>
                  </div>
                </div>
              </div>

              <div className="section">
                <div className="section-head">
                  <div>
                    <div className="section-title">Задания</div>
                    <div className="section-note">Что в работе и что уже проверено</div>
                  </div>
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
                  <div className="upload">
                    <input
                      className="upload-input"
                      type="file"
                      id="file-input"
                      accept="image/*"
                      multiple
                      onChange={handleFiles}
                    />
                    <label className="upload-label" htmlFor="file-input">
                      <span>Перетащи фото сюда или нажми, чтобы выбрать</span>
                      <span className="upload-hint">Можно до 6 фото. Лучше без бликов.</span>
                    </label>
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
                    <button className="btn btn--ghost">Сделать фото с камеры</button>
                    <button className="btn btn--primary" onClick={handleSubmit}>
                      Отправить на проверку
                    </button>
                  </div>
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
                <div className="score-card">
                  <div className="score">4</div>
                  <div className="score-label">Твоя оценка</div>
                </div>
                <div className="score-summary">
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

      <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
    </div>
  );
}
