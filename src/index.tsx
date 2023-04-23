// import { Auth0Provider } from '@auth0/auth0-react';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import App from './components/App';

import 'react-toastify/dist/ReactToastify.css';
import 'tippy.js/dist/tippy.css';
import 'twin.macro';
import './styles/index.scss';

const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);

root.render(
  <>
    {/* <Auth0Provider
      domain="dev-1t7t4gyh7n17hil2.us.auth0.com"
      clientId="fAwyAXet0Z3cuJPx2nS0GWnsXN6pVFEi"
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    > */}
    <ToastContainer position="bottom-right" />
    <App />
    {/* </Auth0Provider> */}
  </>,
);
