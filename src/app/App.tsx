import { getCurrentRoute, routes } from './routes';

function App() {
  const currentRoute = getCurrentRoute(window.location.pathname);

  if (currentRoute === routes.newFile) {
    return (
      <main className="app-shell">
        <header className="page-header">
          <a className="back-link" href={routes.home}>
            wooord
          </a>
          <p className="eyebrow">New file</p>
        </header>
        <section className="content-card" aria-labelledby="new-file-heading">
          <h1 id="new-file-heading" className="page-title">
            Paste vocabulary
          </h1>
          <p className="empty-state">The paste form is not available yet.</p>
        </section>
      </main>
    );
  }

  if (currentRoute === routes.data) {
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

  return (
    <main className="app-shell">
      <section className="home-panel" aria-labelledby="app-title">
        <p className="eyebrow">Dutch - Chinese vocabulary</p>
        <h1 id="app-title">wooord</h1>
        <p className="intro">
          Local Dutch-Chinese vocabulary files for review and listening.
        </p>

        <nav className="quick-actions" aria-label="Primary">
          <a className="primary-action" href={routes.newFile}>
            New file
          </a>
          <a className="secondary-action" href={routes.data}>
            Data
          </a>
        </nav>
      </section>

      <section className="content-section" aria-labelledby="files-heading">
        <div className="section-heading">
          <h2 id="files-heading">Files</h2>
          <a className="text-link" href={routes.newFile}>
            Create
          </a>
        </div>
        <p className="empty-state">
          No vocabulary files yet. Create a file to start building your local
          study list.
        </p>
      </section>
    </main>
  );
}

export default App;
