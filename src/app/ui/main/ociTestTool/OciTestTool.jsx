'use client';
import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';
import { v4 as uuidv4 } from 'uuid';
import styles from './ociTestTool.module.css';
import { CiCircleRemove } from 'react-icons/ci';

const OciTestTool = () => {
  const backendURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
  const [errorMessage, setErrorMessage] = useState('');
  const [sucessMessage, setSuccessMessage] = useState('');
  const [customParams, setCustomParams] = useState([
    { key: '', value: '', id: uuidv4(), prevKey: '' },
  ]);
  const [formData, setFormData] = useState({
    baseURL: '',
    username: '',
    password: '',
    hookURL: '',
  });

  const validateURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Validate URL after the onBlur event on the BaseURL input field
  const handleOnBlur = () => {
    if (!validateURL(formData.baseURL)) {
      setErrorMessage(
        'Please enter a valid URL with the HTTP(S) protocol.'
      );
      setTimeout(() => {
        setErrorMessage('');
      }, 6000);
    } else {
      setErrorMessage(''); // Clear error message if URL is valid
    }
  };

  // Extracting queries from the BaseURL
  const extractParamsFromURL = (baseURL) => {
    if (!baseURL) return;

    if (validateURL(baseURL)) {
      try {
        const url = new URL(baseURL.toLowerCase());
        const searchParams = new URLSearchParams(url.search);

        setFormData((prevData) => ({
          ...prevData,
          username: searchParams.get('username') || '',
          password: searchParams.get('password') || '',
          hookURL: searchParams.get('hook_url') || '',
        }));

        const updatedCustomParams = Array.from(searchParams.entries())
          .filter(
            ([key]) => !['username', 'password', 'hook_url'].includes(key)
          )
          .map(([key, value]) => ({ key, value, id: uuidv4(), prevKey: key }));

        setCustomParams((prevParams) => {
          if (
            JSON.stringify(prevParams) !== JSON.stringify(updatedCustomParams)
          ) {
            return updatedCustomParams.length > 0
              ? updatedCustomParams
              : [{ key: '', value: '', id: uuidv4(), prevKey: '' }];
          }
          return prevParams;
        });
      } catch (error) {
        setErrorMessage('Invalid URL format');
        setTimeout(() => {
          setErrorMessage('');
        }, 6000);
      }
    } else {
      setErrorMessage('');
    }
  };
  // Delay in extracting queries from the BaseURL
  const debouncedExtractParamsFromURL = useCallback(
    debounce((baseURL) => {
      extractParamsFromURL(baseURL);
    }, 500),
    [] // Add extractParamsFromURL as a dependency
  );

  // Update baseURL after Edit or Change
  const updateBaseURLNow = (params) => {
    const { username, password, hookURL, baseURL, customParams } = params;
    if (!baseURL) return;

    try {
      const url = new URL(baseURL.toLowerCase());
      const searchParams = new URLSearchParams(url.search);

      if (username) searchParams.set('username', username);
      else searchParams.delete('username');

      if (password) searchParams.set('password', password);
      else searchParams.delete('password');

      if (hookURL) searchParams.set('hook_url', hookURL);
      else searchParams.delete('hook_url');

      customParams.forEach(({ key, value, prevKey }) => {
        if (prevKey && prevKey !== key) {
          searchParams.delete(prevKey);
        }
        if (key && value) {
          searchParams.set(key, value);
        }
      });

      Array.from(searchParams.keys()).forEach((key) => {
        if (
          key !== 'username' &&
          key !== 'password' &&
          key !== 'hook_url' &&
          !customParams.some((param) => param.key === key)
        ) {
          searchParams.delete(key);
        }
      });

      const newBaseURL = `${url.origin}${url.pathname}?${searchParams.toString()}`;
      setFormData((prevData) => ({
        ...prevData,
        baseURL: newBaseURL,
      }));
    } catch (error) {
      setErrorMessage('');
    }
  };
  //Delay in updating the BaseURL
  const debouncedUpdateBaseURL = useCallback(
    debounce((params) => {
      updateBaseURLNow(params);
    }, 1000),
    [] // Add updateBaseURLNow as a dependency
  );

  // Event listener for the changingthe BaseURL
  useEffect(() => {
    if (formData.baseURL) {
      debouncedExtractParamsFromURL(formData.baseURL);
    } else {
      // Reset only if the previous value was not an empty string
      setFormData((prevData) => {
        if (prevData.baseURL !== '') {
          handleReset();
        }
        return prevData; // Return the current state
      });
    }
  }, [formData.baseURL, debouncedExtractParamsFromURL]);

  // Event listener to update the BaseURL
  useEffect(() => {
    if (!errorMessage) {
      debouncedUpdateBaseURL({ ...formData, customParams });
    }
  }, [
    formData,
    formData.username,
    formData.password,
    formData.hookURL,
    customParams,
    errorMessage,
    debouncedUpdateBaseURL,
  ]);

  //fuction to get the value from the input fields and set data
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const newFormData = { ...prevData, [name]: value.trim() };
      if (name === 'baseURL' && value === '') {
        return {
          baseURL: '',
          username: '',
          password: '',
          hookURL: '',
        };
      }
      return newFormData;
    });
  };

  //fuction to get the value from the custom params fields and set data
  const handleCustomParamChange = (index, field, value) => {
    const trimmedValue = value.trim();
    setCustomParams((prevParams) => {
      const updatedParams = [...prevParams];
      updatedParams[index] = { ...updatedParams[index], [field]: trimmedValue };
      return updatedParams;
    });
  };

  //fuction to create the custom params fields and set data
  const handleAddCustomParams = () => {
    const newParam = { key: '', value: '', id: uuidv4(), prevKey: '' };
    setCustomParams((prevParams) => [...prevParams, newParam]);
  };
  //fuction to remove the custom params fields and set data
  const handleRemoveParam = (index) => {
    setCustomParams((prevParams) => {
      const updatedParams = prevParams.filter((_, i) => i !== index);
      updateBaseURLNow({ ...formData, customParams: updatedParams });
      return updatedParams;
    });
  };

  //fuction to rest all the input fields and set data
  const handleReset = () => {
    setFormData({
      baseURL: '',
      username: '',
      password: '',
      hookURL: '',
    });
    setCustomParams([{ key: '', value: '', id: uuidv4(), prevKey: '' }]);
  };

  const handleSend = async () => {
    const { baseURL, username, password, hookURL } = formData;

    try {
      const response = await fetch(`${backendURL}/api/oci-roundtrip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          baseURL,
          username,
          password,
          hookURL,
          customParams,
        }),
      });

      // Check if the response status is OK
      if (response.ok) {
        const result = await response.json();
        console.log('Backend response:', result);

        // Check if the response contains the updated URL
        if (result.success && result.OciPunchoutURL) {
          // Display success message and open the updated URL
          setSuccessMessage(
            'The OCI PunchOut session will be open in a new window in a few seconds'
          );
          setTimeout(() => {
            setSuccessMessage('');
          }, 6000);

          window.open(result.OciPunchoutURL, '_blank'); // Open the URL in a new tab
        } else {
          // Handle the case where the URL is not returned as expected
          setErrorMessage('The Punchout URL was not retrieved!');
          setTimeout(() => {
            setErrorMessage('');
          }, 6000);
          setSuccessMessage('');
        }
      } else {
        // Parse the error response from the backend
        const errorResult = await response.json();
        setErrorMessage(errorResult.message || 'An unknown error occurred.');
        setTimeout(() => {
          setErrorMessage('');
        }, 6000);
        setSuccessMessage('');
      }
    } catch (error) {
      // Handle any network errors or exceptions
      setErrorMessage(`An error occurred: ${error.message}`);
      setTimeout(() => {
        setErrorMessage('');
      }, 6000);
      setSuccessMessage('');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <div className={styles.inputsPunchout}>
          <div className={styles.label}>Punchout URL</div>
          <input
            className={styles.inputPunchout}
            type="text"
            name="baseURL"
            placeholder="Paste your Punchout URL here ..."
            onChange={handleChange}
            value={formData.baseURL}
            onBlur={handleOnBlur}
            autoComplete="off"
          />
        </div>
        {errorMessage ? (
          <div className={styles.errorMessage}>{errorMessage}</div>
        ) : (
          <div></div>
        )}
        <div className={styles.span}>
          <div className={styles.label}>Credentials</div>
          <div className={styles.hr}></div>
        </div>
        <div className={styles.inputs}>
          <div className={styles.label}>Username</div>
          <input
            className={styles.input}
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username ..."
          />
        </div>
        <div className={styles.inputs}>
          <div className={styles.label}>Password</div>
          <input
            className={styles.input}
            type="text"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password ..."
          />
        </div>
        <div className={styles.inputs}>
          <div className={styles.label}>Hook URL</div>
          <input
            className={styles.input}
            type="text"
            name="hookURL"
            value={formData.hookURL}
            onChange={handleChange}
            placeholder="Enter your hook URL ..."
          />
        </div>
        <div className={styles.span}>
          <div className={styles.label}>Custom Parameters</div>
          <div className={styles.hr}></div>
        </div>
        <div className={styles.customParams}>
          {customParams.map((param, index) => (
            <div key={param.id} className={styles.customInputs}>
              <div className={styles.customLabel}>Custom key</div>
              <input
                className={styles.input}
                type="text"
                value={param.key}
                onChange={(e) =>
                  handleCustomParamChange(index, 'key', e.target.value)
                }
                placeholder="Enter key name ..."
              />
              <div className={styles.customLabel}>Custom value</div>
              <input
                className={styles.input}
                type="text"
                value={param.value}
                onChange={(e) =>
                  handleCustomParamChange(index, 'value', e.target.value)
                }
                placeholder="Enter key value ..."
              />
              <div className={styles.btnContainerAR}>
                <CiCircleRemove
                  size={26}
                  className={styles.removeBtn}
                  onClick={() => handleRemoveParam(index)}
                />
              </div>
            </div>
          ))}
        </div>
        <button className={styles.plusBtn} onClick={handleAddCustomParams}>
          Add Params +
        </button>
      </div>
      {sucessMessage ? (
        <div className={styles.successMessage}>{sucessMessage}</div>
      ) : (
        <div></div>
      )}
      <div className={styles.btnContainer}>
        <button className={styles.btn} onClick={handleReset}>
          Reset
        </button>
        <button className={styles.btn} onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
};

export default OciTestTool;
