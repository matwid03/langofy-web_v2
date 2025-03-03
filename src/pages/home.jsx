import { useEffect, useState } from 'react';
import CustomButton from '../components/CustomButton';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Home = () => {
	const navigate = useNavigate();
	const [points, setPoints] = useState(0);
	const [difficulty, setDifficulty] = useState('easy');
	const [isModalOpen, setIsModalOpen] = useState(false);

	useEffect(() => {
		const fetchUserDetails = async () => {
			const user = FIREBASE_AUTH.currentUser;
			if (!user) {
				return;
			}

			try {
				const userDocRef = doc(FIRESTORE_DB, 'users', user.uid);
				const userDoc = await getDoc(userDocRef);
				if (userDoc.exists()) {
					const userData = userDoc.data();
					const userPoints = userData.points || 0;
					const userDifficultyLevel = userData.difficultyLevel || 'easy';

					setPoints(userPoints);

					setDifficulty(userDifficultyLevel);
				}
			} catch (error) {
				console.error('Błąd podczas pobierania danych:', error);
			}
		};

		console.log(points);
		console.log(difficulty);

		fetchUserDetails();
	}, [difficulty, points]);

	const handleActivitySelect = (activityType) => {
		navigate(`/levels/${difficulty}/${activityType}`);
	};

	return (
		<div className='flex min-h-screen w-full bg-slate-200 items-start justify-center '>
			<div className='p-6 flex flex-col items-center justify-center mt-6'>
				<div className='items-center  mb-4'>
					<img className='w-96 h-96' src={'/icons/logo.png'} alt='logo' />
				</div>
				<div className=' items-center justify-center  px-4'>
					<div className='flex justify-between'>
						<p className='text-gray-950 text-4xl'>Wybierz Konkurencję</p>
						<button onClick={() => setIsModalOpen(true)} className='ml-3 text-gray-600 text-3xl font-bold hover:text-gray-900'>
							?
						</button>
					</div>

					<CustomButton title='Zgadnij Słówko' handlePress={() => handleActivitySelect('translation')} containerStyles='mt-8 w-full' />
					<CustomButton title='Obrazek i Słówko' handlePress={() => handleActivitySelect('imageWord')} containerStyles='mt-8 w-full' />
					<CustomButton title='Tworzenie Zdań' handlePress={() => handleActivitySelect('sentences')} containerStyles='mt-8 w-full' />

					{isModalOpen && (
						<div className='fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50'>
							<div className='bg-white p-6 rounded-xl max-w-md text-center'>
								<h2 className='text-2xl font-bold mb-4'>System Punktacji</h2>
								<p className='text-lg'>
									Masz 10 pytań. Za każdą poprawną odpowiedź otrzymujesz <span className='font-bold'>1 punkt</span>. Jeśli uzyskasz mniej niż <span className='font-bold'>5 punktów</span>, punkty są odejmowane według wzoru: <span className='font-bold'>5 - (liczba poprawnych odpowiedzi)</span>.
								</p>
								<button onClick={() => setIsModalOpen(false)} className='mt-6 bg-blue-500 text-white px-4 py-2 rounded-lg'>
									Zamknij
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Home;
