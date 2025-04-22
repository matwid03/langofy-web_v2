import '../styles.css';
import DictionaryList from '../components/DictionaryList';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../FirebaseConfig';
import AddWordToDictionary from '../components/AddWordToDictionary';

const Dictionary = () => {
	const addWordToDictionary = async (word, translation) => {
		const user = FIREBASE_AUTH.currentUser;
		if (!user) {
			alert('Użytkownik nie jest zalogowany');
			return;
		}

		const userDocRef = doc(FIRESTORE_DB, 'users', user.uid);

		try {
			await updateDoc(userDocRef, {
				dictionary: arrayUnion({ word, translation }),
			});
			console.log('Słowo dodane');
		} catch (error) {
			console.error('Błąd:', error);
		}
	};

	return (
		<div className='bg-slate-200 flex flex-col h-screen'>
			<div className='flex flex-col items-center mt-4 px-4 flex-1 overflow-hidden'>
				<img className='w-96 h-96 mb-[-122px]' src='/icons/book-icon.png' />

				<AddWordToDictionary addWord={addWordToDictionary} />

				<div className='w-full max-w-4xl flex-1 overflow-y-auto border-y-2 border-gray-800 my-2 px-6 pt-2'>
					<DictionaryList />
				</div>
			</div>
		</div>
	);
};

export default Dictionary;
