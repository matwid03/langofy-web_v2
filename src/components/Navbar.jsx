import { Link } from 'react-router-dom';
import { GlobalProvider } from '../context/GlobalProvider';

const Navbar = () => {
	const { isLoggedIn, logout } = GlobalProvider.useGlobalContext();

	return (
		<nav className='bg-blue-600 p-4 text-white flex justify-between items-center fixed w-full top-0'>
			<Link to='/home' className='text-3xl font-bold'>
				Langofy
			</Link>
			<div className='flex gap-4'>
				{isLoggedIn ? (
					<>
						<Link to='/home' className='text-xl hover:underline '>
							Strona główna
						</Link>
						<Link to='/dictionary' className='text-xl hover:underline'>
							Słownik
						</Link>
						<Link to='/profile' className='text-xl hover:underline'>
							Profil
						</Link>
						<button onClick={logout} className='bg-red-500 px-3 py-1 rounded hover:bg-red-700'>
							Wyloguj
						</button>
					</>
				) : (
					<>
						<Link to='/sign-in' className='text-xl hover:underline'>
							Zaloguj się
						</Link>
						<Link to='/sign-up' className='text-xl hover:underline'>
							Zarejestruj się
						</Link>
					</>
				)}
			</div>
		</nav>
	);
};

export default Navbar;
