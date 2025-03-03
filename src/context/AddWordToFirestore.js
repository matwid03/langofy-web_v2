import { useState } from 'react';
import FormField from '../components/FormField';
import CustomButton from '../components/CustomButton';

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
    <div style={{ width: '100%', paddingHorizontal: 16 }}>
      <FormField title="Wprowadź słowo" value={word} handleChangeText={setWord} />
      <FormField title="Wprowadź tłumaczenie" value={translation} handleChangeText={setTranslation} otherStyles="mt-7" />
      <CustomButton title="Dodaj słowo" handlePress={handleSubmit} containerStyles="mt-7 w-full" />
    </div>
  );
};

export default AddWordToDictionary;
