import './styles.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { GlobalProvider } from './context/GlobalProvider.jsx';
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
	<BrowserRouter>
		<GlobalProvider>
			<App />
		</GlobalProvider>
	</BrowserRouter>,
);
