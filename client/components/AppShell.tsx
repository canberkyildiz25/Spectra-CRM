import ProtectedRoute from './ProtectedRoute';
import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden" style={{ background: '#f8fafc' }}>
        <Sidebar />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
