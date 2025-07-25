import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { BuildingProvider } from './contexts/BuildingContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SearchProvider } from './contexts/SearchContext';
import ErrorBoundary from './components/ErrorBoundary';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <AuthProvider>
            <BuildingProvider>
              <OnboardingProvider>
                <NotificationProvider>
                  <SearchProvider>
                    <App />
                  </SearchProvider>
                </NotificationProvider>
              </OnboardingProvider>
            </BuildingProvider>
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>
);