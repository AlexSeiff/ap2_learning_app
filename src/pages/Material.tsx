import { Link, useParams } from 'react-router-dom';
import { Markdown } from '../components/Markdown';
import { useStore } from '../lib/store';
import { Icon } from '../components/Icon';

export function Material() {
  const { docId } = useParams();
  const { content } = useStore();
  const doc = content.materials.find((m) => m.id === docId);

  if (doc) {
    return (
      <div className="page">
        <p className="crumbs">
          <Link to="/material">Material</Link> / {doc.file}
        </p>
        <Markdown math source={doc.file}>
          {doc.markdown}
        </Markdown>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Material</h1>
      <div className="grid">
        <Link to="/material/formeln" className="tile">
          <span className="tile-title">
            <Icon name="sigma" /> Formelsammlung
          </span>
          <span className="tile-meta">alle Formeln der Rechenübungen, nach Thema – druckbar</span>
        </Link>
        <Link to="/material/glossar" className="tile">
          <span className="tile-title">
            <Icon name="library" /> Glossar
          </span>
          <span className="tile-meta">Fachbegriffe von A bis Z – aus Karten und Lernblättern</span>
        </Link>
        <Link to="/material/operatoren" className="tile">
          <span className="tile-title">
            <Icon name="message-square-quote" /> Operatoren-Trainer
          </span>
          <span className="tile-meta">nennen, erläutern, beurteilen … – was verlangt wird, mit Quiz</span>
        </Link>
        {content.materials.map((m) => (
          <Link key={m.id} to={`/material/${m.id}`} className="tile">
            <span className="tile-title">{m.title}</span>
            <span className="tile-meta">{m.file}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
