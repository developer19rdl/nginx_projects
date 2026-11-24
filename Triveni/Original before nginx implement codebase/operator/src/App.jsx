import { useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getTheme } from './theme';
import { ThemeModeProvider, useThemeMode } from './contexts/ThemeModeContext';
import { AuthProvider } from './contexts/AuthContext';
import { PlanningProvider } from './contexts/PlanningContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import ShiftPlan from './pages/ShiftPlan';
import OperatorLog from './pages/OperatorLog';
import Checklist from './pages/Checklist';
import ChecklistTemplate from './pages/ChecklistTemplate';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function ThemedApp() {
  const { mode } = useThemeMode();
  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <PlanningProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/plan" element={<ShiftPlan />} />
                  {/* Downtime and Settings are modals on Home now, not pages - redirect anyone
                      who lands here directly (a stale bookmark, etc.). */}
                  <Route path="/downtime" element={<Navigate to="/" replace />} />
                  <Route path="/settings" element={<Navigate to="/" replace />} />
                  <Route path="/checklist" element={<Checklist />} />
                  <Route path="/checklist/:templateId" element={<ChecklistTemplate />} />
                  <Route path="/operator-log" element={<OperatorLog />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </PlanningProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <ThemeModeProvider>
      <ThemedApp />
    </ThemeModeProvider>
  );
}
