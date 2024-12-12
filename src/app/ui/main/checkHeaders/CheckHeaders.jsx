'use client'; // Indicates that this component is meant to run on the client-side only
import { useState, useEffect } from 'react'; // Import useState hook for state management
import styles from './checkHeaders.module.css'; // Import CSS module for styling
import JSONPretty from 'react-json-pretty'; // Import component for formatted JSON display

// Define custom styles for JSONPretty component
const customTheme = {
  main: 'line-height:1.7;color:var(--textLight);overflow:auto;font-size:14px;min-width:100%;',
  error: 'color:var(--textLight);font-weight:500;',
  key: 'color:var(--textLight);font-weight:400;',
  string: 'color:var(--text);font-weight:500;',
  value: 'color:var(--textLight);font-weight:500;',
  boolean: 'color:var(--textLight);font-weight:500;',
};

// Function to safely stringify objects, handling circular references
const safeStringify = (obj) => {
  const seen = new WeakSet();
  return JSON.stringify(
    obj,
    (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return; // Circular reference found, discard key
        }
        seen.add(value);
      }
      return value;
    },
    2 // Indentation level for pretty-printing
  );
};

const CheckHeaders = () => {
  const backendURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL; // Retrieve backend URL from environment variables

  // State hooks for form data, messages, and response data
  const [formData, setFormData] = useState({
    punchoutURL: '', // URL input by the user
  });
  const [errorMessage, setErrorMessage] = useState(''); // Error message state
  const [successMessage, setSuccessMessage] = useState(''); // Success message state
  const [responseData, setResponseData] = useState(null); // State for storing API response

  // remove error mesages after 8 secs.
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 8000);
      return () => clearTimeout(timer); // Cleanup on unmount
    }
  }, [errorMessage]);

  // Function to validate the punchout URL
  const ValidateURL = () => {
    const { punchoutURL } = formData;
    if (!punchoutURL) {
      setErrorMessage('Please enter a valid URL with the HTTP(S) protocol.'); // Set error if URL is empty
      return false;
    }
    try {
      const urlObject = new URL(punchoutURL); // Create URL object to validate

      if (urlObject.protocol !== 'http:' && urlObject.protocol !== 'https:') {
        setErrorMessage('Please enter a valid URL with the HTTP(S) protocol.'); // Set error if protocol is not HTTP or HTTPS
        return false;
      }

      setFormData({
        ...formData,
        punchoutURL: urlObject.origin, // Update formData with only the origin of the URL
      });
      return true;
    } catch (error) {
      setErrorMessage('Please add te HTTP(s) protocol to the URL.'); // Handle invalid URL format
      return false;
    }
  };

  // Function to handle blur event on input field
  const handleOnBlur = () => {
    ValidateURL();
  };

  // Function to handle changes in the input field
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value, // Update form data with new value
    });
    setErrorMessage(''); // Clear error message when user starts typing
  };

  // Function to handle form submission
  const handleSend = async () => {
    if (!ValidateURL()) return; // Validate URL before sending request

    const { punchoutURL } = formData;

    try {
      setErrorMessage(''); // Clear any previous error messages
      setSuccessMessage('The result will appear here shortly.');

      // Send POST request to backend API
      const response = await fetch(`${backendURL}/api/check-headers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          punchoutURL, // Include punchout URL in request body
        }),
      });

      if (response.ok) {
        // Check if response is successful
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const result = await response.json(); // Parse JSON response
          setResponseData(result); // Update state with response data
          setErrorMessage(''); // Clear error on successful response
        } else {
          setErrorMessage('Data sent, but the response is not JSON.'); // Handle non-JSON response
          setResponseData(null);
        }
      } else {
        const result = await response.json(); // Parse JSON response if the response is not ok
        setSuccessMessage('');
        setErrorMessage(
          `Failed to retrieve data. ${result.error} ${result.details}`
        ); // Set error message
        setResponseData(null);
      }
    } catch (error) {
      setSuccessMessage('');
      setErrorMessage(`Currently we are not able to fetch data. Please try again later. 
        ${error.message}`); // Handle and display error
      setResponseData(null);
    }
  };

  // Function to reset form and clear messages
  const handleReset = () => {
    setFormData({
      punchoutURL: '',
    });
    setErrorMessage('');
    setSuccessMessage('');
    setResponseData(null); // Clear response data on reset
  };

  // Function to handle "Back" button click
  const handleBack = () => {
    setResponseData(null);
    setSuccessMessage('');
    setErrorMessage('');
  };

  // Function to format and display iframe data
  const formatIframes = (iframes) => {
    if (Array.isArray(iframes) && iframes.length >= 0) {
      return iframes.map((iframe, index) => (
        <div className={styles.displayData} key={index}>
          <div>
            Src:
            <span className={styles.title}>{iframe.src}</span>
          </div>
          <div>
            Secure:
            <span className={styles.title}>
              {iframe.isSecure ? 'true' : 'false'}
            </span>
          </div>
          <div>
            Width:
            <span className={styles.title}>
              {iframe.attributes.width || 'Not specified'}
            </span>
          </div>
          <div>
            Height:
            <span className={styles.title}>
              {iframe.attributes.height || 'Not specified'}
            </span>
          </div>
          <div>
            Frameborder:
            <span className={styles.title}>
              {iframe.attributes.frameborder || 'Not specified'}
            </span>
          </div>
        </div>
      ));
    }
    return <div className={styles.title}>No iframes detected.</div>; // Return message if no iframes are found
  };

  return (
    <div className={styles.container}>
      {responseData ? ( // Conditional rendering based on whether responseData is available
        <div className={styles.responseData}>
          <div className={styles.header}>Headers Information</div>
          <div>
            <div className={styles.titles}>HTTP Headers:</div>
            <div className={styles.displayData}>
              <JSONPretty
                data={safeStringify(responseData.httpHeaders)}
                theme={customTheme}
              />
            </div>
          </div>
          <div>
            <div className={styles.titles}>SSL/TLS Info:</div>
            <div className={styles.displayData}>
              <JSONPretty
                data={safeStringify(responseData.sslTlsInfo)}
                theme={customTheme}
              />
            </div>
          </div>
          <div>
            <div className={styles.titles}>Cors status:</div>
            <div className={styles.displayData}>
              <JSONPretty
                data={safeStringify(responseData.corsInfo.status)}
                theme={customTheme}
              />
            </div>
          </div>
          <div>
            <div className={styles.titles}>Mixed Content:</div>
            <div className={styles.displayData}>
              <JSONPretty
                data={responseData.mixedContent}
                theme={customTheme}
              />
            </div>
          </div>
          <div>
            <div className={styles.titles}>Iframes:</div>
            <div className={styles.displayData}>
              {formatIframes(responseData.iframes)}
            </div>
          </div>
          <div>
            <div className={styles.titles}>SameSite Cookies:</div>
            <div className={styles.displayData}>
              <JSONPretty
                data={safeStringify(responseData.sameSiteCookies)}
                theme={customTheme}
              />
            </div>
          </div>
          <div>
            <div className={styles.titles}>X-Frame-Options:</div>
            <div className={styles.displayData}>
              <JSONPretty
                data={safeStringify(responseData.xFrameOptions)}
                theme={customTheme}
              />
            </div>
          </div>
          <div className={styles.btnContainer}>
            <button className={styles.btn} onClick={handleBack}>
              Back
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.form}>
            <div className={styles.inputsPunchout}>
              <div className={styles.label}>Punchout URL</div>
              <input
                className={styles.inputPunchout}
                type="text"
                name="punchoutURL"
                value={formData.punchoutURL}
                onChange={handleChange}
                onBlur={handleOnBlur}
                placeholder="Paste your URL here ..."
              />
            </div>
            {/* Display messages */}
            {errorMessage && (
              <div className={styles.errorMessage}>{errorMessage}</div>
            )}
            {successMessage && (
              <div className={styles.successMessage}>{successMessage}</div>
            )}
            <div className={styles.infoBox}>
              <div className={styles.info}>
                The result of the check headers are as follows:
              </div>
              <div className={styles.info}>HTTP/S Headers</div>
              <div className={styles.info}>SSL/TLS Information</div>
              <div className={styles.info}>Cors Status</div>
              <div className={styles.info}>Mixed Content</div>
              <div className={styles.info}>Iframe</div>
              <div className={styles.info}>SameSite Cookies</div>
              <div className={styles.info}>X-Frame-Options</div>
            </div>
          </div>
          <div className={styles.btnContainer}>
            <button className={styles.btn} onClick={handleReset}>
              Reset
            </button>
            <button
              className={styles.btn}
              onClick={handleSend}
              disabled={!formData.punchoutURL}
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CheckHeaders; // Export the component for use in other parts of the application
