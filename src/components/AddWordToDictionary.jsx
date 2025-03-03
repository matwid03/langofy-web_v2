import { useState } from 'react';
import CustomButton from './CustomButton';
import FormField from './FormField';

const AddWordToDictionary = ({ addWord }) => {
	const [word, setWord] = useState('');
	const [translation, setTranslation] = useState('');

	const handleSubmit = async () => {
		if (!word || !translation) {
			alert('Wprowadź słowo i jego tłumaczenie!');
			return;
		}

		await addWord(word, translation);

		setWord('');
		setTranslation('');
	};

	return (
		<div className='w-full px-4 flex flex-col items-center justify-center'>
			<FormField title='Wprowadź słowo (Ang)' value={word} isDictionary={true} handleChangeText={setWord} />
			<FormField title='Wprowadź tłumaczenie (Pl)' value={translation} isDictionary={true} handleChangeText={setTranslation} otherStyles='mt-7' />
			<CustomButton title='Dodaj słowo' handlePress={handleSubmit} containerStyles='mt-10 mb-4 w-full max-w-2xl' />
		</div>
	);
};

export default AddWordToDictionary;
