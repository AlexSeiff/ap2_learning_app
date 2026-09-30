import { Link } from 'react-router-dom';
import { IS_STATIC } from '../lib/api';

export function Einstellungen() {
  return (
    <div className="page narrow">
      <h1>⚙️ Einstellungen</h1>
      <p className="lead">Passe die App an dich an. Alles gilt nur für dich.</p>

      <p className="hint">
        💾 Deine Einstellungen stehen in deinem Fortschritt ({IS_STATIC ? 'in diesem Browser' : 'lokal auf diesem Rechner'}) und ziehen mit
        jeder Sicherung um. Sichern und Einspielen: <Link to="/daten">Daten &amp; Import</Link>. Das Farbschema (🖥️ / 🌙 / ☀️ unten in der
        Navigation) merkt sich jedes Gerät selbst.
      </p>
    </div>
  );
}
