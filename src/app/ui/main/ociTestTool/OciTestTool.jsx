'use client';
import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';
import { v4 as uuidv4 } from 'uuid';
import styles from './ociTestTool.module.css';
import { CiCircleRemove } from 'react-icons/ci';
import Buffering from '../buffer/BufferComponent';

const OciTestTool = () => {
  const backendURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

  const [method, setMethod] = useState('GET');
  const [errorMessage, setErrorMessage] = useState('');
  const [customParams, setCustomParams] = useState([]); // Start with an empty array
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    baseURL: '', // Initialize as an empty string
    username: '',
    password: '',
    hookURL: '',
  });

  // Ensure UUIDs are only generated on the client-side
  useEffect(() => {
    setCustomParams([{ key: '', value: '', id: uuidv4(), prevKey: '' }]); // Generate UUID on mount
  }, []);

  // Validate URL after the onBlur event on the BaseURL input field
  const validateURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  const handleOnBlur = () => {
    if (!validateURL(formData.baseURL)) {
      setErrorMessage('Please enter a valid URL with the HTTP(S) protocol.');
      setIsLoading(false);
      setTimeout(() => {
        setErrorMessage('');
      }, 6000);
    } else {
      setErrorMessage(''); // Clear error message if URL is valid
    }
  };

  // Extracting queries from the BaseURL to fill in the dedicated fileds
  const extractParamsFromURL = (baseURL) => {
    if (!baseURL) return;
    setIsLoading(false);
    if (validateURL(baseURL)) {
      try {
        const url = new URL(baseURL);
        const searchParams = new URLSearchParams(url.search);

        // Normalize keys to lowercase for comparison but keep values as-is
        const paramsMap = {};
        for (const [key, value] of searchParams.entries()) {
          paramsMap[key.toLowerCase()] = value; // Lowercase the key only
        }

        // Extract form data (using lowercase keys)
        setFormData((prevData) => ({
          ...prevData,
          username: paramsMap['username'] || '', // Case-insensitive lookup
          password: paramsMap['password'] || '', // Case-insensitive lookup
          hookURL: paramsMap['hook_url'] || '', // Case-insensitive lookup
        }));

        // Extract custom params, preserving original key names
        const updatedCustomParams = Array.from(searchParams.entries())
          .filter(
            ([key]) =>
              !['username', 'password', 'hook_url'].includes(key.toLowerCase())
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
        setIsLoading(false);
        setTimeout(() => {
          setErrorMessage('');
        }, 6000);
      }
    } else {
      setErrorMessage('');
    }
  };

  const debouncedExtractParamsFromURL = useCallback(
    debounce((baseURL) => {
      extractParamsFromURL(baseURL);
    }, 500),
    []
  );

  const updateBaseURLNow = (params) => {
    const { username, password, hookURL, baseURL, customParams } = params;
    if (!baseURL) return;

    try {
      const url = new URL(baseURL);
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
      setIsLoading(false);
      setErrorMessage('');
    }
  };

  const debouncedUpdateBaseURL = useCallback(
    debounce((params) => {
      updateBaseURLNow(params);
    }, 1000),
    []
  );

  // Event listener for the changingthe BaseURL
  useEffect(() => {
    if (formData.baseURL) {
      debouncedExtractParamsFromURL(formData.baseURL);
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

  // Function to get the value from the input fields and set data
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => {
      const newValue = value.trim();
      return { ...prevData, [name]: newValue };
    });

    // Special case for baseURL: Reset all associated fields when baseURL is cleared
    if (name === 'baseURL' && value === '') {
      setFormData({
        baseURL: '',
        username: '',
        password: '',
        hookURL: '',
      });
      setCustomParams([{ key: '', value: '', id: uuidv4(), prevKey: '' }]);
    }
  };

  const handleCustomParamChange = (index, field, value) => {
    const trimmedValue = value.trim();
    setCustomParams((prevParams) => {
      const updatedParams = [...prevParams];
      updatedParams[index] = { ...updatedParams[index], [field]: trimmedValue };
      return updatedParams;
    });
  };

  const handleAddCustomParams = () => {
    const newParam = { key: '', value: '', id: uuidv4(), prevKey: '' };
    setCustomParams((prevParams) => [...prevParams, newParam]);
  };

  const handleRemoveParam = (index) => {
    setCustomParams((prevParams) => {
      const updatedParams = prevParams.filter((_, i) => i !== index);
      updateBaseURLNow({ ...formData, customParams: updatedParams });
      return updatedParams;
    });
  };

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
    setIsLoading(true); // Activate the spinner
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

      if (response.ok) {
        setIsLoading(false); // Deactivate the spinner
        const result = await response.json();
        if (result.success && result.response) {
          if (method === 'POST') {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = result.response;
            form.target = '_blank';

            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            form.appendChild(hiddenInput);

            customParams.forEach((param) => {
              const paramInput = document.createElement('input');
              paramInput.type = 'hidden';
              paramInput.name = param.key;
              paramInput.value = param.value;
              form.appendChild(paramInput);
            });

            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);
          } else {
            window.open(result.response, '_blank');
          }
        } else {
          setErrorMessage('The Punchout URL was not retrieved!');
          setIsLoading(false);
          setTimeout(() => {
            setErrorMessage('');
          }, 6000);
        }
      } else {
        setIsLoading(false);
        const errorResult = await response.json();
        setErrorMessage(errorResult.message || 'An unknown error occurred.');
        setTimeout(() => {
          setErrorMessage('');
        }, 6000);
      }
    } catch (error) {
      setIsLoading(false);
      setErrorMessage(`An error occurred: ${error.message}`);
      setTimeout(() => {
        setErrorMessage('');
      }, 6000);
    }
  };

  const handleCloseError = () => {
    setErrorMessage('');
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
          <div className={styles.checkedBox}>
            <div className={styles.checkBoxlabel}>Use POST Method</div>
            <input
              className={styles.checkboxIcon}
              type="checkbox"
              id="usePostMethod"
              checked={method === 'POST'}
              onChange={() => setMethod(method === 'GET' ? 'POST' : 'GET')}
            />
          </div>
        </div>
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
      {errorMessage ? (
        <div className={styles.errorMessage}>
          {errorMessage}
          <CiCircleRemove size={26} onClick={handleCloseError} />
        </div>
      ) : (
        <div className={styles.btnContainer}>
          <button className={styles.btn} onClick={handleReset}>
            Reset
          </button>
          <button className={styles.btn} onClick={handleSend}>
            Send
          </button>
          <Buffering isActive={isLoading} />
        </div>
      )}
    </div>
  );
};

export default OciTestTool;
