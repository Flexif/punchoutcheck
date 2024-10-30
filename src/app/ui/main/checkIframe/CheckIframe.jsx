'use client';
import { useState } from 'react';
import styles from './checkIframe.module.css';

const CheckIframe = () => {
  const backendURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL; // Retrieve backend URL from environment variables
  const [punchoutURL, setPunchoutURL] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [iframeUrl, setIframeUrl] = useState('');
  const [iframeLoadError, setIframeLoadError] = useState(false);

  setTimeout(() => {
    setErrorMessage('');
  }, 6000);


  const handleInputChange = (e) => {
    setPunchoutURL(e.target.value);
    setErrorMessage(''); // Clear any previous error message
    setIframeLoadError(false); // Reset iframe load error
  };

  const ValidateURL = () => {
    if (!punchoutURL) {
      setErrorMessage('Punchout URL cannot be empty.'); // Set error if URL is empty
      return false;
    }
    try {
      const urlObject = new URL(punchoutURL); // Create URL object to validate

      if (urlObject.protocol !== 'http:' && urlObject.protocol !== 'https:') {
        setErrorMessage('Punchout URL must use HTTP or HTTPS.'); // Set error if protocol is not HTTP or HTTPS
        return false;
      }

      return true;
    } catch (error) {
      setErrorMessage('The Punchout URL must use HTTP or HTTPS protocol.'); // Handle invalid URL format
      return false;
    }
  };

  const onBlurHandle = () => {
    ValidateURL();
  };

  const handleCheckBtn = async () => {
    if (!punchoutURL) {
      setError('Punchout URL cannot be empty.');
      return;
    }
    try {
      const objectUrl = new URL(punchoutURL); // Validate the URL
      setIframeUrl(objectUrl.origin); // Set URL for iframe
      console.log(iframeUrl);
      setErrorMessage(''); // Clear any previous error message
      setIframeLoadError(false); // Reset iframe load error
    } catch (e) {
      setErrorMessage('Invalid URL. Please enter a valid URL.');
      setIframeUrl(''); // Clear iframe URL if invalid
      setIframeLoadError(false); // Reset iframe load error
    }
  };

  const handleReset = () => {
    setPunchoutURL('');
    setIframeUrl('');
    setErrorMessage('');
    setIframeLoadError(false);
  };

  // Function to handle iframe load error
  const handleIframeError = () => {
    setIframeLoadError(true);
    setIframeUrl(''); // Clear iframe URL if there's an error
  };

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <div className={styles.inputsPunchout}>
          <div className={styles.label}>Punchout URL</div>
          <input
            className={styles.inputPunchout}
            type="text"
            value={punchoutURL}
            onChange={handleInputChange}
            placeholder="Paste your URL here ..."
            autoComplete="yes"
            onBlur={onBlurHandle}
          />
        </div>
        {iframeUrl && !errorMessage ? (
          <div className={styles.iframeContainer}>
            <iframe
              src={iframeUrl}
              style={{
                marginTop: '20px',
                border: '2px solid #ccc',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                width: '100%', // full width of the container
                height: '500px', // custom height
              }}
              onError={handleIframeError}
            />
            {iframeLoadError && (
              <div className={styles.errorMessage}>
                Failed to load iframe content. The URL may be restricted or
                invalid.
              </div>
            )}
          </div>
        ) : (
          <div></div>
        )}
        {errorMessage && (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}
      </div>
      <div className={styles.btnContainer}>
        <button className={styles.btn} onClick={handleReset}>
          Reset
        </button>
        <button
          className={styles.btn}
          onClick={handleCheckBtn}
          disabled={!punchoutURL}
        >
          Check
        </button>
      </div>
    </div>
  );
};

export default CheckIframe;
