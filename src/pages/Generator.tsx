import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Task, TaskType } from '../../shared/types';
import { useConfirm } from '../hooks/useConfirm';
import { AI_UNAVAILABLE, api, IS_STATIC } from '../lib/api';
import { formatPoints } from '../lib/grading';
import { useStore } from '../lib/store';

const TYPES: { id: TaskType; label: string }[] = [
  { id: 'offen', label: 'Offene Aufgabe / Fachgespräch' },
  { id: 'mc', label: 'Multiple Choice' },
  { id: 'lueckentext', label: 'Lückentext' },
  { id: 'zuordnung', label: 'Zuordnung' },
  { id: 'rechnen', label: 'Rechenaufgabe' },
];

export function Generator() {
  const { content, aiEnabled, aiModel, reload } = useStore();
  const confirm = useConfirm();
  const withTheory = content.topics.filter((t) => t.sections.length);
  const [topicId, setTopicId] = useState(withTheory[0]?.id ?? '01');
  const [count, setCount] = useState(3);
  const [types, setTypes] = useState<TaskType[]>(['offen', 'mc', 'rechnen']);
  const [state, setState] = useState<{ loading?: boolean; error?: string; created?: Task[] }>({});

  const generated = Object.values(content.tasks).filter((t) => t.generated);

  if (IS_STATIC) {
    return (
      <div className="page narrow">
        <h1>KI-Aufgaben</h1>
        <div className="card warn">
          <p>
            <b>🤖 {AI_UNAVAILABLE}</b>
          </p>
          <p>
            Diese Online-Version läuft ohne Server, damit der Schlüssel geheim bleibt. Neue KI-Aufgaben erstellst du in der App auf deinem
            Rechner (<code>Lern-App starten.cmd</code>). Alles andere funktioniert auch hier.
          </p>
        </div>
      </div>
    );
  }

  if (!aiEnabled) {
    return (
      <div className="page narrow">
        <h1>KI-Aufgaben</h1>
        <div className="card warn">
          <p>
            <b>KI-Funktionen sind deaktiviert</b> – es ist kein Claude-API-Schlüssel hinterlegt. Alles andere funktioniert ohne Schlüssel.
          </p>
          <p>So schaltest du sie frei:</p>
          <ol>
            <li>
              API-Schlüssel unter{' '}
              <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer">
                console.anthropic.com
              </a>{' '}
              erstellen.
            </li>
            <li>
              Im Ordner <code>lern-app</code> eine Datei <code>.env.local</code> anlegen mit der Zeile
              <pre>ANTHROPIC_API_KEY=sk-ant-…</pre>
            </li>
            <li>
              Server neu starten (<code>npm run dev</code>).
            </li>
          </ol>
        </div>
      </div>
    );
  }

  const run = async () => {
    setState({ loading: true });
    try {
      const created = await api.generate(topicId, count, types);
      await reload();
      setState({ created });
    } catch (e) {
      setState({ error: (e as Error).message });
    }
  };

  const remove = async (id: string) => {
    const ok = await confirm({ message: 'Diese KI-Aufgabe löschen?', confirmLabel: '🗑️ Löschen', danger: true });
    if (!ok) return;
    await api.deleteGenerated(id);
    await reload();
  };

  return (
    <div className="page">
      <h1>KI-Aufgaben generieren</h1>
      <p className="lead">
        Neue Aufgaben im IHK-Stil – streng auf Basis des jeweiligen Lernblatts, jeweils mit Musterlösung und Punkteschema. Modell:{' '}
        <code>{aiModel}</code>
      </p>
      <div className="card">
        <div className="filters">
          <label>
            Thema
            <select value={topicId} onChange={(e) => setTopicId(e.target.value)}>
              {withTheory.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Anzahl
            <input type="number" min={1} max={10} value={count} onChange={(e) => setCount(Number(e.target.value))} />
          </label>
        </div>
        <div className="type-checks">
          {TYPES.map((t) => (
            <label key={t.id} className="choice">
              <input
                type="checkbox"
                checked={types.includes(t.id)}
                onChange={(e) => setTypes(e.target.checked ? [...types, t.id] : types.filter((x) => x !== t.id))}
              />
              {t.label}
            </label>
          ))}
        </div>
        <button type="button" onClick={run} disabled={state.loading || !types.length}>
          {state.loading ? 'Claude erstellt Aufgaben … (bis ca. 1 Minute)' : '✨ Aufgaben erstellen'}
        </button>
        {state.error && <p className="error">{state.error}</p>}
        {state.created && (
          <p className="ok">
            ✓ {state.created.length} Aufgaben erstellt:{' '}
            {state.created.map((t) => (
              <Link key={t.id} to={`/aufgabe/${t.id}`} className="inline-link">
                {t.code}
              </Link>
            ))}
          </p>
        )}
      </div>

      <section className="card">
        <h2>Gespeicherte KI-Aufgaben ({generated.length})</h2>
        <p className="hint">
          Prüfe generierte Aufgaben kritisch – bei Fehlern einfach löschen. Sie erscheinen auch unter Einzelaufgaben (Filter
          „KI-generiert").
        </p>
        <ul className="task-list">
          {generated.map((t) => (
            <li key={t.id}>
              <Link to={`/aufgabe/${t.id}`} className="task-link">
                <span className="task-code">{t.code}</span>
                <span className="task-preview">
                  {t.markdown
                    .replace(/[*`#>|]/g, '')
                    .split('\n')[0]
                    .slice(0, 120)}
                </span>
              </Link>
              <span className="muted small">{content.topics.find((x) => x.id === t.topicId)?.title}</span>
              <span className="badge">{TYPES.find((x) => x.id === t.type)?.label}</span>
              <span className="badge">{formatPoints(t.points)} P</span>
              <button type="button" className="ghost danger" onClick={() => remove(t.id)} aria-label="Löschen">
                🗑
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
