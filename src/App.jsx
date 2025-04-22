import './styles.css';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import SignIn from './auth/sign-in';
import SignUp from './auth/sing-up';
import Home from './pages/home';
import Dictionary from './pages/dictionary';
import Profile from './pages/profile';
import TestLevel from './levels/testLevel';
import ImageWord from './levels/imageWord';
import Sentences from './levels/sentences';
import Translation from './levels/translation';
import Navbar from './components/Navbar';
import { GlobalProvider } from './context/GlobalProvider';

const App = () => {
	const { isLoading, isLoggedIn, hasTakenTest } = GlobalProvider.useGlobalContext();
	const location = useLocation();

	if (isLoading) return <p>Ładowanie...</p>;
	console.log(isLoading, isLoggedIn, hasTakenTest);
	const shouldShowNavbar = location.pathname !== '/levels/testLevel';

	return (
		<>
			{shouldShowNavbar && <Navbar />}
			<Routes>
				<Route path='/sign-in' element={<SignIn />} />
				<Route path='/sign-up' element={<SignUp />} />

				{isLoggedIn ? (
					<>
						<Route path='/home' element={<Home />} />
						<Route path='/dictionary' element={<Dictionary />} />
						<Route path='/profile' element={<Profile />} />

						{!hasTakenTest ? (
							<Route path='/levels/testLevel' element={<TestLevel />} />
						) : (
							<>
								<Route path='/levels/:difficulty/imageWord' element={<ImageWord />} />
								<Route path='/levels/:difficulty/sentences' element={<Sentences />} />
								<Route path='/levels/:difficulty/translation' element={<Translation />} />
							</>
						)}
					</>
				) : (
					<Route path='*' element={<Navigate to='/sign-in' />} />
				)}
			</Routes>
		</>
	);
};

export default App;
