import React, { useState } from 'react';

const ImageWithFallback = ({ src, alt, className, onClick }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoaded(true);
  };

  const handleError = () => {
    setError(true);
  };

  return (
    <img
      src={error ? '/default-image.png' : loaded ? src : '/loading-image.png'}
      alt={alt}
      className={className}
      onClick={onClick}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
};

export default ImageWithFallback;
