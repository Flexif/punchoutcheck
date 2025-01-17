'use client';
import React, { useState, useEffect } from 'react';
import styles from './cxmlTestTool.module.css';
import Buffering from '../buffer/BufferComponent';

const generateTimestamp = () => {
  const now = new Date();
  return now.toISOString().replace('Z', '+00:00');
};

const generatePayloadID = () =>
  (Math.random() * 1e15).toFixed(0).padStart(15, '0').slice(0, 15);

const CxmlTestTool = () => {
  const backendURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
  const PosrURL = `${backendURL}/api/cxml-punchout`;
  const [errorMessage, setErrorMessage] = useState('');
  const [cxmlPayload, setCxmlPayload] = useState('');
  const [timestamp, setTimestamp] = useState(null);
  const [payloadID, setPayloadID] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize formData without timestamp and payloadID initially
  const [formData, setFormData] = useState({
    fromDomain: 'Network Id',
    fromIdentity: 'Buyer Identity',
    toDomain: 'DUNS',
    toIdentity: 'Supplier Identity',
    senderDomain: 'Network User Id',
    senderIdentity: 'Username',
    sharedSecret: 'Password',
    PayloadId: '',
    timeStamp: '',
    supplierUrl: '',
    buyerUrl: `${backendURL}/api/cxml-data`,
    extrinsicUser: 'punchouttools',
    extrinsicUsername: 'punchouttools',
    extrinsicEmail: 'punchout.user@punchouttools.com',
  });

  // Generate timestamp and payload ID only on the client side (after mount)
  useEffect(() => {
    const generatedTimestamp = generateTimestamp();
    const generatedPayloadID = generatePayloadID();
    setTimestamp(generatedTimestamp);
    setPayloadID(generatedPayloadID);
  }, []);

  // Update formData when timestamp and payloadID are available
  useEffect(() => {
    if (timestamp && payloadID) {
      setFormData((prevData) => ({
        ...prevData,
        PayloadId: `${payloadID}@punchouttools.com`,
        timeStamp: timestamp,
      }));
    }
  }, [timestamp, payloadID]);

  // Clearing error message after 6 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      setErrorMessage('');
    }, 6000);

    return () => clearTimeout(timeout); // Clean up the timeout on unmount
  }, [errorMessage]);

  // Update cXML payload when formData changes
  useEffect(() => {
    const updatedCxmlPayload = `<?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE cXML SYSTEM "http://xml.cxml.org/schemas/cXML/1.2.014/cXML.dtd">
    <cXML xml:lang="en-US" payloadID="${formData.PayloadId}" timestamp="${formData.timeStamp}">
      <Header>
        <From>
          <Credential domain="${formData.fromDomain}">
            <Identity>${formData.fromIdentity}</Identity>
          </Credential>
        </From>
        <To>
          <Credential domain="${formData.toDomain}">
            <Identity>${formData.toIdentity}</Identity>
          </Credential>
        </To>
        <Sender>
          <Credential domain="${formData.senderDomain}">
            <Identity>${formData.senderIdentity}</Identity>
            <SharedSecret>${formData.sharedSecret}</SharedSecret>
          </Credential>
          <UserAgent>punchout</UserAgent>
        </Sender>
      </Header>
      <Request>
        <PunchOutSetupRequest operation="create">
          <BuyerCookie>99ea3c4c8cf9f6dc905a6b6772daa0d1</BuyerCookie>
          <Extrinsic name="FirstName">Punchout</Extrinsic>
          <Extrinsic name="LastName">Tools</Extrinsic>
          <Extrinsic name="UniqueName">${formData.extrinsicUsername}</Extrinsic>
          <Extrinsic name="User">${formData.extrinsicUser}</Extrinsic>
          <Extrinsic name="UserEmail">${formData.extrinsicEmail}</Extrinsic>
          <BrowserFormPost>
            <URL>${formData.buyerUrl}</URL>
          </BrowserFormPost>
          <Contact role="endUser">
            <Name xml:lang="en-US">${formData.extrinsicUser}</Name>
            <Email>${formData.extrinsicEmail}</Email>
          </Contact>
          <SupplierSetup>
            <URL>${formData.supplierUrl}</URL>
          </SupplierSetup>
           <ShipTo>
                <Address>
                    <Name xml:lang="en">Optional</Name>
                    <PostalAddress>
                        <DeliverTo>Optional</DeliverTo>
                        <Street>1301 Optional</Street>
                        <City>Optional</City>
                        <State>CA</State>
                        <PostalCode>92660</PostalCode>
                        <Country isoCountryCode="US">US</Country>
                    </PostalAddress>
                    <Phone name="work">
                        <TelephoneNumber>
                            <CountryCode isoCountryCode="US">+1</CountryCode>
                            <AreaOrCityCode>949</AreaOrCityCode>
                            <Number>5677100</Number>
                        </TelephoneNumber>
                    </Phone>
                </Address>
            </ShipTo>
        </PunchOutSetupRequest>
      </Request>
    </cXML>`;
    setCxmlPayload(updatedCxmlPayload);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setFormData({
      fromDomain: 'Network Id',
      fromIdentity: 'Buyer Identity',
      toDomain: 'DUNS',
      toIdentity: 'Supplier Identity',
      senderDomain: 'Network User Id',
      senderIdentity: 'Username',
      sharedSecret: 'Password',
      PayloadId: generatePayloadID() + '@punchouttools.com',
      timeStamp: generateTimestamp(),
      supplierUrl: '',
      buyerUrl: formData.buyerUrl,
      extrinsicUser: 'punchouttools',
      extrinsicUsername: 'punchouttools',
      extrinsicEmail: 'user@punchouttools.com',
    });
    setErrorMessage(''); // Clear any previous error messages on reset
  };

  const handleSend = async () => {
   
      if (!formData.supplierUrl) {
        setErrorMessage('Please enter a valid URL with the HTTP(S) protocol.');
        setIsLoading(false);
        return;
      }

      if (!cxmlPayload) {
        setErrorMessage('cXML Payload is missing');
        setIsLoading(false);
        return; // No need to throw an error, we are handling it with state
      }
      // Clear any previous error messages before sending the request
      setErrorMessage('');
      setIsLoading(true); // Activate the spinner
      try {
      // Send POST request to the backend
      const response = await fetch(PosrURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Sending JSON data
        },
        body: JSON.stringify({
          formData,
          cxmlPayload,
          supplierUrl: formData.supplierUrl.trim(),
        }),
      });
      if (response.ok) {
        setIsLoading(false); // Deactivate the spinner
         // Convert response to text
        const responseData = await response.text();
         // Extract URL using regular expressions
        const urlMatch = responseData.match(/<URL>(.*?)<\/URL>/);
        if (urlMatch && urlMatch[1]) {
          const extractedUrl = urlMatch[1].replace(/&amp;/g, '&'); // Replace HTML entities with their actual characters
  
          // Open the URL in a new window or tab
          window.open(extractedUrl, '_blank');
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
    }
  };

  const handleTextareaPaste = (event) => {
    event.preventDefault();

    // Get pasted data via clipboard API
    const pastedData = event.clipboardData.getData('text');

    // Set the pasted data as cxmlPayload
    setCxmlPayload(pastedData);

    // Parse the pasted XML data to update the form fields
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(pastedData, 'text/xml');

      // Helper function to safely get text content from an XML element
      const getElementText = (selector) => {
        const element = xmlDoc.querySelector(selector);
        return element ? element.textContent : '';
      };

      // Helper function to safely get an attribute from an XML element
      const getElementAttribute = (selector, attribute) => {
        const element = xmlDoc.querySelector(selector);
        return element ? element.getAttribute(attribute) : '';
      };

      const newFormData = {
        fromDomain: getElementAttribute('From > Credential', 'domain') || '',
        fromIdentity: getElementText('From > Credential > Identity') || '',
        toDomain: getElementAttribute('To > Credential', 'domain') || '',
        toIdentity: getElementText('To > Credential > Identity') || '',
        senderDomain:
          getElementAttribute('Sender > Credential', 'domain') || '',
        senderIdentity: getElementText('Sender > Credential > Identity') || '',
        sharedSecret:
          getElementText('Sender > Credential > SharedSecret') || '',
        PayloadId: getElementAttribute('cXML', 'payloadID') || '',
        timeStamp: getElementAttribute('cXML', 'timestamp') || '',
        supplierUrl: getElementText('SupplierSetup > URL') || '',
        extrinsicUser: getElementText('Extrinsic[name="User"]') || '',
        extrinsicUsername: getElementText('Extrinsic[name="UniqueName"]') || '',
        extrinsicEmail: getElementText('Extrinsic[name="UserEmail"]') || '',
        // Keep the buyerUrl unchanged
        buyerUrl: formData.buyerUrl,
      };

      setFormData(newFormData);
    } catch (error) {
      setIsLoading(false);
      console.error('Error parsing cXML:', error);
      // Optionally log the error, but do not set an error message in the state
    }
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.inputsPunchout}>
        <div className={styles.label}>Punchout URL</div>
        <input
          className={styles.inputPunchout}
          type="text"
          name="supplierUrl"
          value={formData.supplierUrl}
          onChange={handleChange}
          required
          autoComplete="off"
          placeholder="Paste your Punchout URL here ..."
        />
      </div>
      <div>
        {errorMessage === '' ? (
          ''
        ) : (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}
      </div>
      <div className={styles.span}>
        Credentials
        <div className={styles.hr}></div>
      </div>
      <div className={styles.form}>
        <div className={styles.leftContainer}>
          {Object.keys(formData)
            .filter((key) => key !== 'cxmlPayload')
            .map((key) => (
              <div className={styles.inputs} key={key}>
                <div className={styles.label}>
                  {key.split(/(?=[A-Z])/).join(' ')}
                </div>
                <input
                  className={styles.input}
                  type="text"
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                />
              </div>
            ))}
        </div>
        <div className={styles.rightContainer}>
          <textarea
            className={styles.textarea}
            value={cxmlPayload}
            onChange={(e) => setCxmlPayload(e.target.value)}
            onPaste={handleTextareaPaste}
          />
        </div>
      </div>
      <div className={styles.btnContainer}>
        <button type="button" className={styles.btn} onClick={handleReset}>
          Reset
        </button>
        <button type="button" className={styles.btn} onClick={handleSend}>
          Send
        </button>
        <Buffering isActive={isLoading} />
      </div>
    </div>
  );
};

export default CxmlTestTool;
