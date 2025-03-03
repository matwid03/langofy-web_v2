const CustomButton = ({ title, handlePress, containerStyles, disabled, textStyles = 'text-white' }) => {
	return (
		<button disabled={disabled} onClick={handlePress} className={`group bg-blue-600 hover:bg-blue-700  rounded-xl min-h-[62px] w-full justify-center items-center ${containerStyles}  ${disabled ? 'cursor-not-allowed' : ''}`}>
			<span className={`text-2xl  ${textStyles} group-hover:text-white`}>{title}</span>
		</button>
	);
};

export default CustomButton;
