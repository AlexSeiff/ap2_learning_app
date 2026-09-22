import { Link, useParams } from 'react-router-dom';
import { Markdown } from '../components/Markdown';
import { useStore } from '../lib/store';

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
        <Markdown>{doc.markdown}</Markdown>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Material</h1>
      <div className="grid">
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
