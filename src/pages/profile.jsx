import { useEffect, useState } from 'react';
import CustomButton from '../components/CustomButton';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../FirebaseConfig';
import { collection, doc, getDoc, getDocs, limit, orderBy, query, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [username, setUsername] = useState('');
	const [avatar, setAvatar] = useState('');
	const [avatarUrl, setAvatarUrl] = useState('');
	const [showAvatarForm, setShowAvatarForm] = useState(false);
	const [topPlayers, setTopPlayers] = useState([]);
	const [user, setUser] = useState(null);
	const navigate = useNavigate();
	const defaultAvatar = './icons/user-avatar.svg';

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (currentUser) => {
			if (currentUser) {
				setUser(currentUser);
				setUsername(currentUser.displayName);
				fetchProfileData(currentUser.uid);
			} else {
				setUser(null);
				navigate('/sign-in');
			}
		});

		return () => unsubscribe();
	}, [navigate]);

	const fetchProfileData = async (userId) => {
		try {
			const userDocRef = doc(FIRESTORE_DB, 'users', userId);
			const userDoc = await getDoc(userDocRef);
			if (userDoc.exists()) {
				setAvatar(userDoc.data().avatarUrl || '');
			}
		} catch (error) {
			console.error('Błąd podczas pobierania danych użytkownika:', error);
		}
	};

	const fetchTopPlayers = async () => {
		try {
			const playersRef = collection(FIRESTORE_DB, 'users');
			const q = query(playersRef, orderBy('points', 'desc'), limit(10));
			const querySnapshot = await getDocs(q);
			setTopPlayers(querySnapshot.docs.map((doc) => doc.data()));
		} catch (error) {
			console.error('Błąd podczas pobierania rankingu:', error);
		}
	};

	useEffect(() => {
		fetchTopPlayers();
	}, []);

	const handleSignOut = async () => {
		setIsLoading(true);
		await FIREBASE_AUTH.signOut();
		alert('Wylogowano!');
		navigate('/sign-in');
		setIsLoading(false);
	};

	const updateAvatar = async () => {
		if (!avatarUrl) {
			alert('Proszę wprowadzić URL avatara!');
			return;
		}

		try {
			setIsLoading(true);

			const userDocRef = doc(FIRESTORE_DB, 'users', user.uid);
			await updateDoc(userDocRef, { avatarUrl });

			setAvatar(avatarUrl);
			setIsLoading(false);
			alert('Avatar został zaktualizowany!');
			setShowAvatarForm(false);
		} catch (error) {
			console.error('Błąd podczas aktualizacji avatara:', error.message);
			setIsLoading(false);
		}
	};

	const toggleAvatarForm = () => {
		setShowAvatarForm(!showAvatarForm);
	};

	return (
		<div className='bg-slate-200 min-h-screen'>
			<div className=' flex items-start gap-96 mt-16'>
				<div className='ml-10 mt-12'>
					<button onClick={toggleAvatarForm} className='mb-4'>
						{avatar ? (
							<img src={avatar} alt='Avatar' className='w-24 h-24 rounded-full' />
						) : (
							<div className='w-24 h-24 rounded-full bg-gray-400 flex items-center'>
								<p className='text-xl text-blue-500'>Dodaj avatar</p>
							</div>
						)}
					</button>

					{showAvatarForm && (
						<div className='mb-4 flex gap-4 items-center justify-center'>
							<input type='text' className='border border-gray-300 rounded p-2' placeholder='Wprowadź URL avatara' value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
							<button className=' bg-blue-500 text-white p-2 rounded' onClick={updateAvatar} disabled={isLoading}>
								{isLoading ? 'Ładowanie...' : 'Zaktualizuj Avatar'}
							</button>
						</div>
					)}

					<p className='text-xl text-gray-950'>Nazwa użytkownika: {username}</p>
					<p className='text-xl text-gray-950 '>Email: {FIREBASE_AUTH.currentUser?.email}</p>
				</div>

				<div className='mt-10 mr-10 px-6 border-y-2 border-gray-800 pt-6 w-full max-w-4xl'>
					<p className='text-2xl text-gray-950 mb-4 text-center'>Ranking graczy:</p>
					{topPlayers.map((player, index) => (
						<div key={index} className={`flex items-center justify-between px-2 py-2 border-b border-gray-300 ${player.username === username ? 'font-bold' : ''}`}>
							<div className='flex items-center gap-4'>
								<img src={player.avatarUrl ? player.avatarUrl : defaultAvatar} alt={`${player.username} avatar`} className='w-10 h-10 rounded-full border border-gray-400' />
								<p className='text-xl text-gray-950'>
									{index + 1}. {player.username}
								</p>
							</div>
							<p className='text-xl text-gray-950'>{player.points} pkt</p>
						</div>
					))}
				</div>
			</div>
			<div className='w-full flex justify-center mt-24'>
				<CustomButton title='Wyloguj się' handlePress={handleSignOut} containerStyles='mt-2 mb-8 w-full max-w-2xl' isLoading={isLoading} />
			</div>
		</div>
	);
};

export default Profile;
