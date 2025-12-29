import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="spinner-overlay">
        <div className={`spinner spinner-${size}`}></div>
      </div>
    );
  }

  return <div className={`spinner spinner-${size}`}></div>;
};

export default LoadingSpinner;
