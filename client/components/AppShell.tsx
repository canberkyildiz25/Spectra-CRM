import ProtectedRoute from './ProtectedRoute';
import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      {/* The ground was hard-coded #f8fafc, which is why the app kept its old
          cool-white behind every themed surface. It follows the theme now. */}
      <div
        className="flex h-screen overflow-hidden"
        style={{ background: 'var(--color-bg)' }}
      >
        {/* Keyboard users land here first; without it the only way past the
            rail is to tab through every nav item on every page. */}
        <a href="#content" className="skip-link">
          İçeriğe geç
        </a>

        <Sidebar />

        {/* A real landmark. The content was in an anonymous div, so a screen
            reader had no "main" to jump to. */}
        <main id="content" className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
