import { useState, useEffect } from 'react';
import { arrayRemove, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../FirebaseConfig';

const DictionaryList = () => {
	const [dictionary, setDictionary] = useState([]);

	useEffect(() => {
		const user = FIREBASE_AUTH.currentUser;
		if (!user) {
			return;
		}

		const userDocRef = doc(FIRESTORE_DB, 'users', user.uid);

		const unsubscribe = onSnapshot(userDocRef, (doc) => {
			if (doc.exists()) {
				setDictionary(doc.data().dictionary || []);
			}
		});

		return () => unsubscribe();
	}, []);

	const handleRemoveWord = async (wordToRemove) => {
		const user = FIREBASE_AUTH.currentUser;
		if (!user) {
			return;
		}

		const userDocRef = doc(FIRESTORE_DB, 'users', user.uid);

		try {
			await updateDoc(userDocRef, {
				dictionary: arrayRemove(wordToRemove),
			});
		} catch (error) {
			console.log('Błąd', error);
		}
	};

	return (
		<div className='flex flex-col h-full'>
			<div className='grid grid-cols-2 text-2xl font-bold pb-2 border-b border-gray-400'>
				<p className='text-left'>Słowo:</p>
				<p className='text-left'>Tłumaczenie:</p>
			</div>

			{dictionary.length === 0 ? (
				<p className='text-2xl mt-4'>Brak słów w słowniku</p>
			) : (
				<div className='overflow-y-auto flex-1'>
					{dictionary.map((item, index) => (
						<div key={index} className='grid grid-cols-2 items-center px-2 py-2 border-b border-gray-300'>
							<p className='text-3xl'>{item.word}</p>
							<div className='flex justify-between items-center'>
								<p className='text-3xl'>{item.translation}</p>
								<button onClick={() => handleRemoveWord(item)} className='text-red-700 text-2xl ml-4'>
									X
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default DictionaryList;
