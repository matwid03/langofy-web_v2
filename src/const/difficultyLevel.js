import { doc, getDoc, updateDoc } from "firebase/firestore";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../FirebaseConfig";


export const updateUserPoints = async (finalPoints) => {
  const user = FIREBASE_AUTH.currentUser;
  if (user) {
    const userDocRef = doc(FIRESTORE_DB, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      let newPoints = userData.points || 0;

      if (finalPoints < 5) {
        const pointsToDeduct = 5 - finalPoints;
        newPoints -= pointsToDeduct;
      } else {
        newPoints += finalPoints;
      }

      await updateDoc(userDocRef, { points: newPoints });
      updateDifficultyLevel(newPoints, userDocRef);
    }
  }
};

export const updateDifficultyLevel = async (points, userDocRef) => {
  let newDifficulty = 'easy';
  if (points >= 100) {
    newDifficulty = 'hard';
  } else if (points >= 50) {
    newDifficulty = 'medium';
  }

  await updateDoc(userDocRef, { difficultyLevel: newDifficulty });
};