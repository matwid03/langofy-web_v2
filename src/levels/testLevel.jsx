import { useCallback, useEffect, useState } from 'react';
import CustomButton from '../components/CustomButton';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { FaHeart, FaHeartBroken } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../context/GlobalProvider';
import { difficultyLevelString } from '../const/stringMap';

const TestLevel = () => {
	const { updateUserTestStatus, handleTestComplete } = useGlobalContext();
	const [difficultyLevel, setDifficultyLevel] = useState('hard');
	const [questionCount, setQuestionCount] = useState(1);
	const [question, setQuestion] = useState(null);
	const [options, setOptions] = useState([]);
	const [usersLife, setUsersLife] = useState([...Array(3).fill(true)]);
	const [questionsList, setQuestionsList] = useState([]);
	const [usedQuestionIndices, setUsedQuestionIndices] = useState([]);
	const maxQuestionCount = 20;
	const navigate = useNavigate();

	useEffect(() => {
		alert('Przed przystąpieniem do nauki sprawdźmy twój poziom znajomości angielskiego 😀');

		console.log(FIREBASE_AUTH.currentUser);
	}, []);

	const fetchQuestions = useCallback(async (level) => {
		try {
			const docRef = doc(FIRESTORE_DB, 'words', level);
			const wordRef = await getDoc(docRef);
			const wordList = wordRef.data();
			if (wordList) {
				const wordsArray = Object.values(wordList);
				return getUniqueWords(wordsArray, 23);
			}
		} catch (error) {
			console.error('Błąd podczas pobierania pytań:', error);
			throw error;
		}
	}, []);

	const loadQuestion = useCallback((questions, usedIndices) => {
		const availableIndices = questions.map((_, index) => index).filter((index) => !usedIndices.includes(index));
		if (availableIndices.length > 0) {
			const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
			const selectedQuestion = questions[randomIndex];
			setQuestion(selectedQuestion);
			setUsedQuestionIndices([...usedIndices, randomIndex]);
			generateOptions(selectedQuestion, questions);
		} else {
			console.error('Brak dostępnych pytań.');
		}
	}, []);

	const initializeQuestions = useCallback(async () => {
		if (FIREBASE_AUTH.currentUser) {
			try {
				const questions = await fetchQuestions(difficultyLevel);
				setQuestionsList(questions);
				setUsedQuestionIndices([]);
				loadQuestion(questions, []);
			} catch (error) {
				console.error('Błąd podczas inicjalizacji pytań:', error);
			}
		} else {
			console.log('Użytkownik nie jest zalogowany');
		}
	}, [difficultyLevel, fetchQuestions, loadQuestion]);

	useEffect(() => {
		initializeQuestions();
	}, [difficultyLevel, initializeQuestions]);

	const generateOptions = (word, allWords) => {
		const correctOption = word.translation;
		const incorrectOptions = allWords.filter((w) => w.word !== word.word).map((w) => w.translation);
		const randomIncorrectOption = incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)];
		const allOptions = [correctOption, randomIncorrectOption].sort(() => Math.random() - 0.5);
		setOptions(allOptions);
	};

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

	const handleCorrectAnswer = () => {
		setQuestionCount(questionCount + 1);
		loadQuestion(questionsList, usedQuestionIndices);
	};

	const handleWrongAnswer = () => {
		setUsersLife((prevLives) => {
			const newLives = [...prevLives];
			const lastTrueIndex = newLives.lastIndexOf(true);
			if (lastTrueIndex !== -1) newLives[lastTrueIndex] = false;
			return newLives;
		});

		if (usersLife.every((life) => life === false)) {
			if (difficultyLevel === 'easy') {
				handleTestComplete(difficultyLevel);
				updateUserTestStatus(true);
			} else {
				changeLevelOfTest();
			}
		} else {
			loadQuestion(questionsList, usedQuestionIndices);
		}
	};

	const changeLevelOfTest = () => {
		setDifficultyLevel((prevLevel) => {
			if (prevLevel === 'hard') return 'medium';
			if (prevLevel === 'medium') return 'easy';
			return 'easy';
		});
		setUsersLife([...Array(3).fill(true)]);
	};

	useEffect(() => {
		if (questionCount > maxQuestionCount) {
			handleTestComplete(difficultyLevel);
			updateUserTestStatus(true);
		}
	}, [questionCount, difficultyLevel, handleTestComplete, updateUserTestStatus]);

	return (
		<div className='bg-slate-200 px-4 min-h-screen '>
			<p className='text-3xl text-red-900 capitalize'>Poziom: {difficultyLevelString[difficultyLevel]}</p>
			<div className='flex gap-10 items-center mt-2'>{usersLife.map((element, index) => (element ? <FaHeart key={index} size={50} color='#b90606' /> : <FaHeartBroken key={index} size={50} color='#b90606' />))}</div>
			<div className='flex flex-col w-full bg-slate-200 items-center justify-center '>
				<p
					className='text-3xl text-gray-950 text-center mb-4 
			'>
					{questionCount < 20 ? questionCount : 20} / {maxQuestionCount}
				</p>

				{question &&
					(questionCount < 21 ? (
						<>
							<span
								className='text-3xl text-gray-950 text-center mb-10
					'>
								{question.word}
							</span>
							{options.map((option, index) => (
								<CustomButton containerStyles='mt-8 max-w-3xl ' textStyles='text-3xl text-white' key={index} title={option} handlePress={() => (option === question.translation ? handleCorrectAnswer() : handleWrongAnswer())} />
							))}
						</>
					) : (
						<p className='text-8xl text-center mt-4'>'👏🏻'</p>
					))}

				<div className='w-full flex justify-end mt-4'>
					<img className='w-96 h-96' src={'/icons/logo.png'} alt='logo' />
				</div>
				<CustomButton
					title='Wyloguj się'
					handlePress={() => {
						FIREBASE_AUTH.signOut();
						navigate('/sign-in');
					}}
					containerStyles='w-full max-w-2xl mb-7'
				/>
			</div>
		</div>
	);
};

export default TestLevel;
