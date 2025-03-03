import { useState } from 'react';
import FormField from '../components/FormField';
import CustomButton from '../components/CustomButton';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../FirebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../context/GlobalProvider';

const SignUp = () => {
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const navigate = useNavigate();
	const auth = FIREBASE_AUTH;
	const { setIsRegistering } = useGlobalContext();

	const submit = async () => {
		setErrorMessage('');

		setIsLoading(true);
		setIsRegistering(true);
		try {
			const userCredential = await createUserWithEmailAndPassword(auth, email, password);

			const user = userCredential.user;

			await updateProfile(user, {
				displayName: username,
			});

			const userDocRef = doc(FIRESTORE_DB, 'users', user.uid);
			await setDoc(userDocRef, {
				username: username,
				email: email,
				dictionary: [],
				points: 0,
				avatarUrl: '',
				hasTakenTest: false,
			});

			await FIREBASE_AUTH.signOut();

			navigate('/sign-in');
			alert('Pomyślna rejestracja!');
		} catch (error) {
			if (error.code === 'auth/email-already-in-use') {
				setErrorMessage('Podany e-mail jest już zajęty!');
			} else if (error.code === 'auth/weak-password') {
				setErrorMessage('Hasło powinno zawierać minimum 6 znaków!');
			} else if (error.code === 'auth/invalid-email') {
				setErrorMessage('Niepoprawny format adresu e-mail!');
			} else {
				setErrorMessage('Wystąpił błąd podczas rejestracji. Spróbuj ponownie.');
			}
		} finally {
			setIsLoading(false);
			setIsRegistering(false);
		}
	};

	return (
		<div className='flex min-h-screen w-full bg-slate-200 items-start justify-center '>
			<div className='p-6 flex flex-col items-center justify-center mt-6'>
				<div className='items-center  mb-4'>
					<img className='w-96 h-96' src={'/icons/logo.png'} alt='logo' />
				</div>
				<FormField title='Nazwa użytkownika' placeholder='Nazwa użytkownika' value={username} handleChangeText={(e) => setUsername(e)} />

				<FormField title='Email' placeholder='Email' value={email} handleChangeText={(e) => setEmail(e)} otherStyles='mt-4' keyboardType='email-address' />

				<FormField title='Hasło' placeholder='Hasło' value={password} handleChangeText={(e) => setPassword(e)} otherStyles='mt-4' />

				{errorMessage && <p className='text-red-600 mt-4 text-xl font-semibold'>{errorMessage}</p>}

				<CustomButton disabled={!email || !password || !username} title='Zarejestruj się' handlePress={submit} containerStyles='mt-16 mb-2' isLoading={isLoading} />

				<div className='justify-center pt-5 flex gap-2'>
					<p className='text-xl text-gray-950'>Masz już konto?</p>
					<Link to='/sign-in' className='text-xl text-blue-800 font-semibold'>
						Zaloguj się
					</Link>
				</div>
			</div>
		</div>
	);
};

export default SignUp;
