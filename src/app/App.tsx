import { getCurrentRoute, routes } from './routes';
import { FileListPage } from '../features/files/FileListPage';
import { FileViewPage } from '../features/files/FileViewPage';
import { NewFilePage } from '../features/files/NewFilePage';

function App() {
  const currentRoute = getCurrentRoute(window.location.pathname);

  if (currentRoute.name === 'newFile') {
    return <NewFilePage />;
  }

  if (currentRoute.name === 'file') {
    return <FileViewPage fileId={currentRoute.fileId} />;
  }

  if (currentRoute.name === 'data') {
    return (
      <main className="app-shell">
        <header className="page-header">
          <a className="back-link" href={routes.home}>
            wooord
          </a>
          <p className="eyebrow">Data</p>
        </header>
        <section className="content-card" aria-labelledby="data-heading">
          <h1 id="data-heading" className="page-title">
            Local data
          </h1>
          <p className="empty-state">Data tools are not available yet.</p>
        </section>
      </main>
    );
  }

  return <FileListPage />;
}

export default App;
