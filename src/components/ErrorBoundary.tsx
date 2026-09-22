import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { error: Error | null };

// Fängt Abstürze einer Seite ab, damit Navigation und Speicherstatus sichtbar bleiben.
// In App.tsx per key an die aktuelle Route gebunden: ein Seitenwechsel setzt den Fehler zurück.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Seite abgestürzt:', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div className="page narrow">
        <div className="card warn" role="alert">
          <h2>⚠ Hier ist etwas schiefgelaufen</h2>
          <p>
            Diese Seite konnte nicht angezeigt werden. Dein gespeicherter Fortschritt bleibt erhalten. Lade die Seite neu oder wähle links
            eine andere Seite.
          </p>
          <pre className="error-text">{error.message || String(error)}</pre>
          <button type="button" onClick={() => window.location.reload()}>
            ↻ Neu laden
          </button>
        </div>
      </div>
    );
  }
}
