import ReactDOM from 'react-dom/client';

import { App } from '@/app/components/App';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') ?? document.body,
);

root.render(<App />);
