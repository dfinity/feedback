// import { Auth0Provider } from '@auth0/auth0-react';
import { createRoot } from 'react-dom/client';
import App from './components/App';

const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);

root.render(<App />);
