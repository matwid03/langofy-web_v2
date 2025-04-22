import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../FirebaseConfig';
import CustomButton from '../components/CustomButton';
import { updateUserPoints } from '../const/difficultyLevel';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { difficultyLevelString } from '../const/stringMap';

const Sentences = () => {
	const [words, setWords] = useState([]);
	const [currentWord, setCurrentWord] = useState(null);
	const [selectedWords, setSelectedWords] = useState([]);
	const [showResult, setShowResult] = useState(false);
	const [isCorrect, setIsCorrect] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [points, setPoints] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [shuffledChoices, setShuffledChoices] = useState([]);

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
					const wordsArray = Object.values(wordList).filter((word) => word.sentence && word.sentenceAng);
					const selectedWords = getUniqueWords(wordsArray, 10);

					setWords(selectedWords);
					if (selectedWords.length > 0) {
						setCurrentWord(selectedWords[0]);
						setShuffledChoices(shuffleArray(selectedWords[0].choices));
					}
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

	const shuffleArray = (array) => {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array.map((item, index) => ({ id: `${item}-${index}`, word: item }));
	};

	const handleWordClick = (word) => {
		setSelectedWords([...selectedWords, word]);
	};

	const handleRemoveWord = (index) => {
		const newSelectedWords = [...selectedWords];
		newSelectedWords.splice(index, 1);
		setSelectedWords(newSelectedWords);
	};

	const handleCheckAnswer = async () => {
		if (isLoading) return;
		setIsLoading(true);

		const userAnswer = selectedWords
			.map((wordObj) => wordObj.word)
			.join(' ')
			.toLowerCase();
		const correctAnswer = currentWord.sentenceAng.toLowerCase();
		const isAnswerCorrect = userAnswer === correctAnswer;
		setIsCorrect(isAnswerCorrect);

		if (isAnswerCorrect) {
			setPoints((prevPoints) => prevPoints + 1);
		}

		setShowResult(true);

		if (currentIndex === 9) {
			await updateUserPoints(points + (isAnswerCorrect ? 1 : 0));
			navigate('/home');
		} else {
			setTimeout(() => {
				setCurrentIndex((prevIndex) => prevIndex + 1);
				if (words.length > currentIndex + 1) {
					setCurrentWord(words[currentIndex + 1]);
					setShuffledChoices(shuffleArray(words[currentIndex + 1].choices));
				}
				setSelectedWords([]);
				setShowResult(false);
				setIsLoading(false);
			}, 1000);
		}
	};

	const renderChoices = () => {
		return (
			<div className='flex flex-wrap justify-center gap-4'>
				{shuffledChoices.map((item, index) => (
					<div className='flex justify-center w-1/4 mb-4' key={item.id || index}>
						<CustomButton title={item.word} handlePress={() => handleWordClick(item)} containerStyles='min-w-[40px] px-4' disabled={selectedWords.some((selected) => selected.id === item.id)} />
					</div>
				))}
			</div>
		);
	};

	return (
		<div className='bg-slate-200 min-h-screen flex flex-col items-center '>
			<p className='text-xl mt-24'>Poziom: {difficultyLevelString[difficulty]}</p>
			<p className='ml-2 text-3xl text-blue-600'>Poprawne odpowiedzi: {points}</p>
			{currentWord && (
				<div className='mt-4 w-full flex flex-col items-center '>
					<div className='mt-2 w-full flex flex-col items-center justify-center'>
						<p className='text-gray-950 text-3xl mb-4 mx-2'>{currentWord.sentence}</p>
						<div className='min-h-[80px] md:w-[640px] border-2 border-blue-600 rounded-xl bg-white w-80 p-4 mb-4 flex-wrap flex flex-row gap-4'>
							{selectedWords.map((word, index) => (
								<button key={word.id || `${word.word}-${index}`} onClick={() => handleRemoveWord(index)}>
									<p className='text-black text-3xl'>{word.word} </p>
								</button>
							))}
						</div>
						<div className='flex mb-8 ml-6'>{renderChoices()}</div>
						{!showResult && <CustomButton containerStyles='mb-4 w-80 bg-white border-2 border-blue-600 max-w-xl' textStyles='text-gray-950 ' title='Sprawdź' handlePress={handleCheckAnswer} disabled={isLoading} />}
						{showResult && (
							<div className='flex flex-col items-center justify-center mt-4 '>
								{isCorrect ? <FaCheckCircle size={50} color='green' /> : <FaTimesCircle name='times-circle' size={50} color='red' />}
								<p className='text-gray-950 mt-2 text-2xl'>{isCorrect ? 'Odpowiedź poprawna!' : 'Odpowiedź niepoprawna!'}</p>
							</div>
						)}
					</div>

					{!showResult && (
						<div className='absolute bottom-4 left-0 right-0 flex flex-col items-center '>
							<div className='bg-gray-700 w-11/12 h-4 rounded-full'>
								<div className='bg-blue-600 h-4 rounded-full' style={{ width: `${((currentIndex + 1) / 10) * 100}%` }} />
							</div>
							<p className='text-gray-950 text-2xl mt-2'>{`${currentIndex + 1} / 10`}</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default Sentences;
