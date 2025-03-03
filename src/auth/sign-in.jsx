import '../styles.css';
import { useState } from 'react';
import FormField from '../components/FormField';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../FirebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import CustomButton from '../components/CustomButton';
import { useGlobalContext } from '../context/GlobalProvider';

const SignIn = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const { setHasTakenTest, setUser } = useGlobalContext();
	const auth = FIREBASE_AUTH;
	const navigate = useNavigate();

	const submit = async () => {
		setErrorMessage('');
		if (!email || !password) {
			alert('Nieudane logowanie', 'Wypełnij wszystkie pola!');
		} else {
			try {
				const userCredential = await signInWithEmailAndPassword(auth, email, password);
				const user = userCredential.user;
				setUser(user);

				const userDoc = await getDocs(query(collection(FIRESTORE_DB, 'users'), where('email', '==', email)));
				if (!userDoc.empty) {
					const userData = userDoc.docs[0].data();
					setHasTakenTest(userData.hasTakenTest);

					if (userData.hasTakenTest) {
						navigate('/home');
					} else {
						navigate('/levels/testLevel');
					}
				}
			} catch (e) {
				console.log(e);

				setErrorMessage('Nieprawidłowy e-mail lub hasło!');
			}
		}
	};

	return (
		<div className='flex min-h-screen w-full bg-slate-200 items-start justify-center '>
			<div className='p-6 flex flex-col items-center justify-center mt-6'>
				<div className='items-center mb-4'>
					<img className='w-96 h-96' src={'/icons/logo.png'} alt='logo' />
				</div>
				<FormField title='Email' placeholder='Email' value={email} handleChangeText={(e) => setEmail(e)} />

				<FormField title='Hasło' placeholder='Hasło' value={password} handleChangeText={(e) => setPassword(e)} otherStyles='mt-6' />

				{errorMessage && <p className='text-red-600 mt-4 text-xl font-semibold'>{errorMessage}</p>}

				<CustomButton disabled={!email || !password} title='Zaloguj się' handlePress={submit} containerStyles='mt-20 mb-4' />

				<div className='flex justify-center pt-5 gap-2'>
					<p className='text-xl text-gray-950'>Nie masz jeszcze konta?</p>
					<Link to='/sign-up' className='text-xl font-semibold text-blue-800'>
						Zarejestruj się
					</Link>
				</div>
			</div>
		</div>
	);
};

export default SignIn;
