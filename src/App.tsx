import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ThemeProvider   from './components/layout/ThemeProvider';
import ToastContainer  from './components/toast/ToastContainer';
import ProtectedRoute  from './components/layout/ProtectedRoute';
import AdminRoute      from './components/layout/AdminRoute';
import BoardLayout     from './components/layout/BoardLayout';
import BoardView       from './components/board/BoardView';
import LoginPage       from './pages/LoginPage';
import RegisterPage    from './pages/RegisterPage';
import ProfilePage     from './pages/ProfilePage';
import AdminPage       from './pages/AdminPage';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<ProtectedRoute><BoardLayout /></ProtectedRoute>}>
            <Route index element={<BoardView />} />
          </Route>
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/admin"   element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="*"        element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </ThemeProvider>
  );
}

export default App;
