import { useState } from 'react';
import { icons } from '../const/icons';

const FormField = ({ title, value, placeholder, handleChangeText, otherStyles, isDictionary = false }) => {
	const [showPassword, setshowPassword] = useState(false);

	return (
		<div className={` ${otherStyles}`}>
			{isDictionary && <p className='text-2xl text-gray-950'>{title}</p>}

			<div className='relative flex items-center w-full min-w-[1000px]'>
				<input className='w-full text-gray-950 text-2xl rounded-xl p-2 my-4' value={value} placeholder={placeholder} onChange={(e) => handleChangeText(e.target.value)} type={title === 'Hasło' ? (showPassword ? 'text' : 'password') : 'text'} />

				{title === 'Hasło' && (
					<button onClick={() => setshowPassword(!showPassword)} className='absolute right-0'>
						<img src={!showPassword ? icons.eye : icons.eyeHide} className='w-12 h-12 object-contain' />
					</button>
				)}
			</div>
		</div>
	);
};

export default FormField;
