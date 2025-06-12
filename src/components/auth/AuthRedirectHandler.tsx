import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthRedirectHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have auth tokens in the URL hash
    const hash = window.location.hash;
    const search = window.location.search;

    console.log('AuthRedirectHandler - checking URL:', {
      hash,
      search,
      fullUrl: window.location.href,
      pathname: window.location.pathname
    });

    // Only process if we're on the root path
    if (window.location.pathname !== '/') {
      console.log('Not on root path, skipping redirect handler');
      return;
    }

    // Check for password reset tokens
    const hashParams = new URLSearchParams(hash.substring(1));
    const searchParams = new URLSearchParams(search);

    const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
    const type = hashParams.get('type') || searchParams.get('type');

    console.log('Extracted tokens:', { accessToken: !!accessToken, type });

    if (accessToken) {
      if (type === 'recovery') {
        console.log('Found password reset tokens, redirecting to reset-password');
        // Use window.location to ensure the hash is preserved
        window.location.href = `/reset-password${hash}`;
        return;
      }

      if (type === 'signup') {
        console.log('Found signup confirmation tokens, redirecting to login');
        window.location.href = `/login${hash}`;
        return;
      }

      // Any other access token, redirect to login
      console.log('Found other access token, redirecting to login');
      window.location.href = `/login${hash}`;
      return;
    }

    // If no auth tokens found, continue to normal landing page
    console.log('No auth tokens found, staying on landing page');
  }, [navigate]);

  // Return null - this component just handles redirects
  return null;
};

export default AuthRedirectHandler;
