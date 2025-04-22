import { createContext, useContext, useState, useEffect } from 'react';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../FirebaseConfig';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [hasTakenTest, setHasTakenTest] = useState(false);
	const [isRegistering, setIsRegistering] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		const unsubscribe = FIREBASE_AUTH.onAuthStateChanged(async (user) => {
			if (user && !isRegistering) {
				setIsLoggedIn(true);
				setUser(user);

				const userDoc = await getDocs(query(collection(FIRESTORE_DB, 'users'), where('uid', '==', user.uid)));
				if (!userDoc.empty) {
					const userData = userDoc.docs[0].data();
					setHasTakenTest(userData.hasTakenTest);
				}
				setIsLoading(false);
			} else {
				setIsLoggedIn(false);
				setUser(null);
				setIsLoading(false);
			}
		});

		return () => unsubscribe();
	}, [isRegistering]);

	const logout = async () => {
		await FIREBASE_AUTH.signOut();
		setIsLoggedIn(false);
		setUser(null);
		navigate('/sign-in');
	};

	const updateUserTestStatus = async (status) => {
		if (user) {
			const userDocRef = doc(FIRESTORE_DB, 'users', user.uid);
			await updateDoc(userDocRef, { hasTakenTest: status });
			setHasTakenTest(status);
		}
	};

	const handleTestComplete = async (finalDifficultyLevel) => {
		const user = FIREBASE_AUTH.currentUser;
		let initialPoints = 0;

		switch (finalDifficultyLevel) {
			case 'hard':
				initialPoints = 100;
				break;
			case 'medium':
				initialPoints = 50;
				break;
			case 'easy':
				initialPoints = 0;
				break;
		}

		if (user) {
			const userDocRef = doc(FIRESTORE_DB, 'users', user.uid);
			await updateDoc(userDocRef, {
				hasTakenTest: true,
				difficultyLevel: finalDifficultyLevel,
				points: initialPoints,
			});
		}
		setHasTakenTest(true);
		navigate('/home');
	};

	useEffect(() => {
		console.log('GlobalProvider state:', { isLoggedIn, hasTakenTest });
	}, [isLoggedIn, hasTakenTest]);

	return (
		<GlobalContext.Provider
			value={{
				isLoggedIn,
				setIsLoggedIn,
				user,
				setUser,
				isLoading,
				setIsLoading,
				setHasTakenTest,
				hasTakenTest,
				updateUserTestStatus,
				handleTestComplete,
				logout,
				setIsRegistering,
			}}>
			{children}
		</GlobalContext.Provider>
	);
};

GlobalProvider.useGlobalContext = function () {
	return useContext(GlobalContext);
};
