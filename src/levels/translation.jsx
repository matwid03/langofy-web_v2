import { useCallback, useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../FirebaseConfig';
import CustomButton from '../components/CustomButton';
import { FaVolumeUp, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { updateUserPoints } from '../const/difficultyLevel';
import { useNavigate, useParams } from 'react-router-dom';
import { difficultyLevelString } from '../const/stringMap';

const Translation = () => {
	const [words, setWords] = useState([]);
	const [fullWordsList, setFullWordsList] = useState([]);
	const [currentWord, setCurrentWord] = useState(null);
	const [options, setOptions] = useState([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [points, setPoints] = useState(0);
	const [showResult, setShowResult] = useState(false);
	const [isCorrect, setIsCorrect] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const navigate = useNavigate();
	const { difficulty } = useParams();

	const generateOptions = useCallback((selectedWord, wordsList) => {
		const correctTranslation = selectedWord.translation;
		let option1 = correctTranslation;
		let option2, option3;

		do {
			option2 = wordsList[Math.floor(Math.random() * wordsList.length)].translation;
		} while (option2 === option1);

		do {
			option3 = wordsList[Math.floor(Math.random() * wordsList.length)].translation;
		} while (option3 === option1 || option3 === option2);

		const optionsArray = [
			{ id: 1, text: option1, correct: true },
			{ id: 2, text: option2, correct: false },
			{ id: 3, text: option3, correct: false },
		];

		setOptions(shuffleArray(optionsArray));
	}, []);

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
					const wordsArray = Object.values(wordList);
					const selectedWords = getUniqueWords(wordsArray, 10);

					setFullWordsList(wordsArray);
					setWords(selectedWords);
					setCurrentWord(selectedWords[0]);
					generateOptions(selectedWords[0], wordsArray);
				}
			} catch (error) {
				console.error('Błąd podczas pobierania słów:', error);
			}
		};
		console.log('Difficulty:', difficulty);

		fetchWords();
	}, [difficulty, generateOptions]);

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

	const shuffleArray = (array) => {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	};

	const handleCheckAnswer = async (correct) => {
		setIsCorrect(correct);
		if (isLoading) return;
		setIsLoading(true);

		if (correct) {
			setPoints((prevPoints) => prevPoints + 1);
		}

		setShowResult(true);

		if (currentIndex === 9) {
			await updateUserPoints(points + (correct ? 1 : 0));
			navigate('/home');
		} else {
			setTimeout(() => {
				setCurrentIndex((prevIndex) => prevIndex + 1);
				setCurrentWord(words[currentIndex + 1]);
				generateOptions(words[currentIndex + 1], fullWordsList);
				setShowResult(false);
				setIsLoading(false);
			}, 1000);
		}
	};

	const playPronunciation = async () => {
		if (currentWord && currentWord.audio) {
			try {
				const audio = new Audio(currentWord.audio);
				audio.volume = 1.0;
				audio.play();
			} catch (error) {
				console.error('Błąd podczas odtwarzania wymowy:', error);
			}
		}
	};

	return (
		<div className='bg-slate-200 min-h-screen flex flex-col items-center'>
			<p className='text-xl mt-36'>Poziom: {difficultyLevelString[difficulty]}</p>
			<p className='ml-2 text-3xl text-blue-600'>Poprawne odpowiedzi: {points}</p>
			{currentWord && (
				<div className='mt-16 w-full flex flex-col items-center '>
					<div className='flex gap-4'>
						<p className='text-gray-950 text-3xl mb-16'>{currentWord.word}</p>
						{currentWord.audio && <FaVolumeUp className='cursor-pointer' size={40} color='black' onClick={playPronunciation} />}
					</div>
					{options.map((item) => (
						<CustomButton containerStyles='mb-8 w-80 max-w-xl' title={item.text} handlePress={() => handleCheckAnswer(item.correct)} key={item.id.toString()} disabled={isLoading} />
					))}
				</div>
			)}
			{showResult && (
				<div className='flex flex-col items-center justify-center mt-4'>
					{isCorrect ? <FaCheckCircle size={60} color='green' /> : <FaTimesCircle name='times-circle' size={60} color='red' />}
					<p className='text-gray-950 mb-4 mt-2 text-2xl'>{isCorrect ? 'Odpowiedź poprawna!' : 'Odpowiedź niepoprawna!'}</p>
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

export default Translation;
