import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './features/auth/context/AuthContext';
import { AppRouter } from './routes/AppRouter';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}
