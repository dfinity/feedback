import { Auth0Provider } from '@auth0/auth0-react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';

import 'tippy.js/dist/tippy.css';
import 'twin.macro';
import './styles/index.scss';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <Auth0Provider
      domain="dev-1t7t4gyh7n17hil2.us.auth0.com"
      clientId="fAwyAXet0Z3cuJPx2nS0GWnsXN6pVFEi"
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      <ToastContainer />
      <App />
    </Auth0Provider>
  </StrictMode>,
);
