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
		<div className='bg-slate-200 flex flex-col min-h-screen overflow-hidden'>
			<div className='flex flex-col items-center overflow-y-auto mt-20'>
				<img className='w-96 h-96 mt-[-56px] mb-[-96px]' src={'/icons/book-icon.png'} />
				<AddWordToDictionary addWord={addWordToDictionary} />
				<DictionaryList />
			</div>
		</div>
	);
};

export default Dictionary;
