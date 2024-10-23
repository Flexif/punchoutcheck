'use client'; // Ensure this component is treated as a client component
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './displayCxmlCart.module.css';
import { MdOutlineExpandCircleDown } from "react-icons/md";
import { IoChevronUpCircleOutline } from "react-icons/io5";
import { FcInfo } from "react-icons/fc";
import dynamic from 'next/dynamic';

// Dynamic import for XMLViewer to avoid SSR issues
const XMLViewer = dynamic(() => import('react-xml-viewer'), { ssr: false });

const DisplayCxmlCart = () => {
  const backendURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
  const [infoMessage, setInfoMessage] = useState('');
  const [displayInfo, setDisplayInfo] = useState(false);
  const [displayXML, setDisplayXML] = useState(false);
  const [xmlData, setXmlData] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
  const [xmlDocId, setXmlDocId] = useState(null);

  // Custom theme for XMLViewer
  const customTheme = {
    attributeKeyColor: 'var(--text)', // Using --iconHover for attribute keys
    attributeValueColor: 'navy', // Using --text for attribute values
    cdataColor: 'var(--textLight)', // Using --textLight for CDATA
    commentColor: 'var(--textLight)', // Using --textLight for comments
    separatorColor: 'var(--textLight)', // Using --textLight for separators
    tagColor: 'var(--text)', // Using --text for tag names
    textColor: 'red', // Using --text for text content
  };

  const handleDisplayButton = () => {
    setDisplayInfo((prev) => !prev);
    setDisplayXML(false);
  };

  const handleDisplayXML = () => {
    setDisplayXML((prev) => !prev);
  };

  const handleInfoMessage = () => {
    setInfoMessage('A Purchase Order is created if you have a Punchout Order Request license.');
    setTimeout(() => { setInfoMessage('') }, 10000);
  };

  // Set xmlDocId from searchParams when it changes
  useEffect(() => {
    const id = searchParams.get('xmlDocId');
    if (id) {
      setXmlDocId(id);
    }
  }, [searchParams]);

  // Fetch data based on xmlDocId
  useEffect(() => {
    const fetchData = async () => {
      if (xmlDocId === null) {
        setLoading(false);
        return; // Early return if there's no xmlDocId
      }
      
      setLoading(true); // Start loading
      try {
        const response = await fetch(`${backendURL}/api/cxml-data/${xmlDocId}`);
        if (response.ok) {
          const data = await response.json();
          setXmlData(data.xml);  // Set raw XML data for display
          setJsonData(data.json); // Set parsed JSON data for table
        } else {
          setError('Failed to fetch data');
        }
      } catch (fetchError) {
        console.error('Fetch Error:', fetchError);
        setError('Failed to fetch data');
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchData();
  }, [xmlDocId, backendURL]); // Fetch data when xmlDocId changes

  // Conditional rendering based on loading and error states
  if (loading) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.container}>Error: {error}</div>;
  }

  if (!jsonData || !xmlData) {
    return <div className={styles.container}>No data found.</div>;
  }

  const { cXML } = jsonData;
  const supplierDomain = cXML.Header[0].From[0].Credential[0].$.domain;
  const buyerDomain = cXML.Header[0].To[0].Credential[0].$.domain;
  const message = cXML.Message[0].PunchOutOrderMessage[0];
  const items = message.ItemIn;
  const currencySymbol = message.PunchOutOrderMessageHeader[0].Total[0].Money[0].$?.currency || "";

  // Calculate total cart price
  const totalCartPrice = items.reduce((total, item) => {
    const quantity = parseFloat(item.$.quantity);
    const unitPrice = parseFloat(item.ItemDetail[0].UnitPrice[0].Money[0]._); // Note: Adjust if structure is different
    return total + (quantity * unitPrice);
  }, 0);

  return (
    <div className={styles.container}>
      <Suspense fallback={<div>Loading cart details...</div>}>
        <button className={styles.button} onClick={handleDisplayButton}>
          {displayInfo ? <IoChevronUpCircleOutline size={23} /> : <MdOutlineExpandCircleDown size={23} />} Shopping Cart Details
        </button>
        {displayInfo && (
          <div className={styles.expand}>
            <div className={styles.credentials}>
              <div className={styles.supplier}>
                <p className={styles.title}>Supplier headers</p>
                <p>Credentials: {supplierDomain}</p>
                <p>Supplier Identity: {cXML.Header[0].From[0].Credential[0].Identity[0]}</p>
              </div>
              <div className={styles.buyer}>
                <p className={styles.title}>Buyers headers</p>
                <p>Credentials: {buyerDomain}</p>
                <p>Buyer Identity: {cXML.Header[0].To[0].Credential[0].Identity[0]}</p>
              </div>
              <div className={styles.sender}>
                <p className={styles.title}>Sender headers</p>
                <p>Sender Identity: {cXML.Header[0].Sender[0].Credential[0].Identity[0]}</p>
                <p>User Agent: {cXML.Header[0].Sender[0].UserAgent[0]}</p>
              </div>
              <div className={styles.cartInfo}>
                <p className={styles.title}>cXML details</p>
                <div className={styles.payload}>Payload ID: {cXML.$.payloadID}</div>
                <div className={styles.timestamp}>Timestamp: {cXML.$.timestamp}</div>
              </div>
            </div>
            <div className={styles.cXMLContainer} onClick={handleDisplayXML}>
              {displayXML ? (
                <div className={styles.cXML}>
                  <XMLViewer xml={xmlData} theme={customTheme} />
                </div>
              ) : (
                <button className={styles.cXMLButton}>
                  <MdOutlineExpandCircleDown size={23} />
                  <p>Show cXML version</p>
                </button>
              )}
            </div>
          </div>
        )}

        <div>
          <h4>Items</h4>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thTitles}>Item Name/Description</th>
                <th className={styles.thTitles}>Supplier Part ID</th>
                <th className={styles.thTitles}>Quantity</th>
                <th className={styles.thTitles}>Unit Price</th>
                <th className={styles.thTitles}>Currency</th>
                <th className={styles.thTitles}>Unit of Measure</th>
                <th className={styles.thTitles}>UNSPSC Code</th>
                <th className={styles.thTitles}>Total Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const quantity = parseFloat(item.$.quantity);
                const unitPrice = parseFloat(item.ItemDetail[0].UnitPrice[0].Money[0]._); // Ensure this matches the XML structure
                const totalPrice = quantity * unitPrice;

                return (
                  <tr key={index}>
                    <td>{item.ItemDetail[0].Description[0]._}</td>
                    <td>{item.ItemID[0].SupplierPartID[0]}</td>
                    <td>{quantity}</td>
                    <td>{unitPrice}</td>
                    <td>{currencySymbol}</td>
                    <td>{item.ItemDetail[0].UnitOfMeasure[0]}</td>
                    <td>{item.ItemDetail[0].Classification[0]._}</td>
                    <td>{totalPrice.toFixed(2)}</td>
                  </tr>
                );
              })}
              <tr>
                <td colSpan="7" className={styles.totalPrice}>Total Cart Price</td>
                <td><strong>{totalCartPrice.toFixed(2)} {currencySymbol}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles.btnContainer}>
          <button className={styles.btnPO} onClick={handleInfoMessage}>Create PO</button>
        </div>
        {infoMessage && <div className={styles.infoBox}><FcInfo />{infoMessage}</div>}
      </Suspense>
    </div>
  );
};

export default DisplayCxmlCart;
