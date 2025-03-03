import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../FirebaseConfig';
import CustomButton from '../components/CustomButton';
import FormField from '../components/FormField';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { updateUserPoints } from '../const/difficultyLevel';
import { useNavigate, useParams } from 'react-router-dom';
import { difficultyLevelString } from '../const/stringMap';

const ImageWord = () => {
	const [words, setWords] = useState([]);
	const [currentWord, setCurrentWord] = useState(null);
	const [userInput, setUserInput] = useState('');
	const [showResult, setShowResult] = useState(false);
	const [isCorrect, setIsCorrect] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [points, setPoints] = useState(0);
	const [isLoading, setIsLoading] = useState(false);

	const navigate = useNavigate();
	const { difficulty } = useParams();

	useEffect(() => {
		const user = FIREBASE_AUTH.currentUser;
		if (!user) {
			return;
		}

		const fetchWords = async () => {
			try {
				const docRef = doc(FIRESTORE_DB, 'words', difficulty);
				const wordRef = await getDoc(docRef);
				const wordList = wordRef.data();
				if (wordList) {
					const wordsArray = Object.values(wordList).filter((word) => word.imgUrl);
					const uniqueWords = getUniqueWords(wordsArray, 10);
					setWords(uniqueWords);
					setCurrentWord(uniqueWords[0]);
				}
			} catch (error) {
				console.error('Błąd podczas pobierania słów:', error);
			}
		};
		fetchWords();
	}, [difficulty]);

	const getUniqueWords = (array, count) => {
		const uniqueSet = new Set();
		const result = [];
		while (uniqueSet.size < count && array.length > 0) {
			const randomIndex = Math.floor(Math.random() * array.length);
			const word = array[randomIndex];
			if (!uniqueSet.has(word.word)) {
				uniqueSet.add(word.word);
				result.push(word);
			}
		}
		return result;
	};

	const handleCheckAnswer = async () => {
		if (isLoading) return;
		setIsLoading(true);

		const isAnswerCorrect = userInput.trim().toLowerCase() === currentWord.word.toLowerCase();
		setIsCorrect(isAnswerCorrect);

		if (isAnswerCorrect) {
			console.log('Odpowiedź poprawna');
			setPoints((prevPoints) => prevPoints + 1);
		} else {
			console.log('Odpowiedź niepoprawna');
		}

		setShowResult(true);

		if (currentIndex === 9) {
			await updateUserPoints(points + (isAnswerCorrect ? 1 : 0));
			navigate('/home');
		} else {
			setTimeout(() => {
				setCurrentIndex((prevIndex) => prevIndex + 1);
				setCurrentWord(words[currentIndex + 1]);
				setUserInput('');
				setShowResult(false);
				setIsLoading(false);
			}, 1000);
		}
	};

	return (
		<div className='bg-slate-200 min-h-screen flex flex-col items-center'>
			<p className='text-xl mt-36'>Poziom: {difficultyLevelString[difficulty]}</p>
			<p className='ml-2 text-3xl text-blue-600'>Poprawne odpowiedzi: {points}</p>
			{currentWord && (
				<div className='mt-16 w-full flex flex-col items-center max-w-2xl'>
					<img className='w-80 h-80' src={currentWord.imgUrl} />
					<FormField value={userInput} handleChangeText={(text) => setUserInput(text)} otherStyles='mb-7' placeholder='Podaj odpowiedź...' />
					{!showResult && (
						<CustomButton
							containerStyles='mb-8 max-w-xl'
							title='Sprawdź'
							handlePress={() => {
								handleCheckAnswer();
							}}
							disabled={isLoading}
						/>
					)}
					{showResult && (
						<div className='flex flex-col items-center justify-center mt-4'>
							{isCorrect ? <FaCheckCircle size={60} color='green' /> : <FaTimesCircle size={60} color='red' />}
							<p className='text-gray-950 mb-4 mt-2 text-2xl'>{isCorrect ? 'Odpowiedź poprawna!' : 'Odpowiedź niepoprawna'}</p>
						</div>
					)}
				</div>
			)}
			<div className='absolute bottom-4 left-0 right-0 flex flex-col items-center'>
				<div className='bg-gray-700 w-11/12 h-4 rounded-full'>
					<div className='bg-blue-600 h-4 rounded-full' style={{ width: `${((currentIndex + 1) / 10) * 100}%` }} />
				</div>
				<p className='text-gray-950 text-2xl mt-2'>{`${currentIndex + 1} / 10`}</p>
			</div>
		</div>
	);
};

export default ImageWord;
