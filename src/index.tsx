import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'twin.macro';

import App from './components/App';
import './styles/index.scss';

const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
