'use client'; // Ensure this component is treated as a client component
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './displayCxmlCart.module.css';
import { MdOutlineExpandCircleDown } from 'react-icons/md';
import { IoChevronUpCircleOutline } from 'react-icons/io5';
import { FcInfo } from 'react-icons/fc';

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

  const customTheme = {
    attributeKeyColor: 'var(--text)', // Using --iconHover for attribute keys
    attributeValueColor: '#a80000', // Using --text for attribute values
    cdataColor: 'var(--textLight)', // Using --textLight for CDATA
    commentColor: 'var(--textLight)', // Using --textLight for comments
    separatorColor: 'var(--textLight)', // Using --textLight for separators
    tagColor: 'var(--text)', // Using --text for tag names
    textColor: '#0062ff', // Using --text for text content
  };

  const handleDisplayButton = () => {
    setDisplayInfo((prev) => !prev);
    setDisplayXML(false);
  };

  const handleDisplayXML = () => {
    setDisplayXML((prev) => !prev);
  };

  const handleInfoMessage = () => {
    setInfoMessage(
      'A Purchase Order is created if you have a Punchout Order Request license.'
    );
    setTimeout(() => {
      setInfoMessage('');
    }, 10000);
  };

  // Set xmlDocId from searchParams when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = searchParams.get('xmlDocId');
      if (id) {
        setXmlDocId(id);
      }
    }
  }, [searchParams]);

  // Fetch data based on xmlDocId
  useEffect(() => {
    if (!xmlDocId) {
      setLoading(false); // Avoid unnecessary loading state
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${backendURL}/api/cxml-data/${xmlDocId}`);
        if (response.ok) {
          const data = await response.json();
          setXmlData(data.xml);
          setJsonData(data.json);
        } else {
          setError('Failed to fetch data');
        }
      } catch (error) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [xmlDocId]);

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
  const currencySymbol =
    message.PunchOutOrderMessageHeader[0].Total[0].Money[0].$?.currency || '';

  // Calculate total cart price
  const totalCartPrice = items.reduce((total, item) => {
    const quantity = parseFloat(item.$.quantity);
    const unitPrice = parseFloat(item.ItemDetail[0].UnitPrice[0].Money[0]._); // Note: Adjust if structure is different
    return total + quantity * unitPrice;
  }, 0);

  // Function to convert XML to JSX
  const xmlToJSX = (node, index = 0, level = 0) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.nodeName;
      const attributes = Array.from(node.attributes);
      const children = Array.from(node.childNodes);

      return (
        <div
          key={`${tagName}-${index}`}
          style={{ marginLeft: `${level * 10}px` }}
        >
          {/* Opening tag */}
          <span className={styles.tag} style={{ color: customTheme.tagColor }}>
            &lt;{tagName}
          </span>
          {/* Attributes */}
          {attributes.map((attr) => (
            <span
              key={`${tagName}-${index}-${attr.name}`}
              className={styles.attribute}
              style={{ color: customTheme.attributeKeyColor }}
            >
              {` ${attr.name}="`}
              <span
                className={styles.attributeValue}
                style={{ color: customTheme.attributeValueColor }}
              >
                {attr.value}
              </span>
              {'"'}
            </span>
          ))}
          <span className={styles.tag} style={{ color: customTheme.tagColor }}>
            &gt;
          </span>

          {/* Children */}
          {children.length === 0 ? (
            // Self-closing tag for empty elements
            <span style={{ color: customTheme.textColor }}>
              /&lt;{tagName}&gt;
            </span>
          ) : (
            <div>
              {/* If there are text nodes or other child elements, ensure proper spacing */}
              {children.map((child, childIndex) => {
                // If the child is a text node, render it correctly
                if (child.nodeType === Node.TEXT_NODE) {
                  const trimmedText = child.nodeValue.trim();
                  return (
                    trimmedText && (
                      <div
                        className={styles.textValue}
                        key={`${trimmedText}-${childIndex}`}
                        style={{
                          color: customTheme.textColor,
                          marginLeft: `${level * 5}px`,
                        }}
                      >
                        {trimmedText}
                      </div>
                    )
                  );
                }
                return xmlToJSX(child, childIndex, level + 1);
              })}
              {/* Closing tag */}
              <span
                className={styles.tagName}
                style={{ color: customTheme.tagColor }}
              >
                &lt;/{tagName}&gt;
              </span>
            </div>
          )}
        </div>
      );
    } else if (node.nodeType === Node.TEXT_NODE) {
      // Handle text nodes directly, but ensure they are trimmed
      const trimmedText = node.nodeValue.trim();
      return (
        trimmedText && (
          <div
            className={styles.textValue}
            style={{
              color: customTheme.textColor,
              marginLeft: `${level * 20}px`,
            }}
            key={`${trimmedText}-${index}`}
          >
            {trimmedText}
          </div>
        )
      );
    }

    return null; // Ignore other node types
  };

  return (
    <div className={styles.container}>
      <Suspense fallback={<div>Loading cart details...</div>}>
        <button className={styles.button} onClick={handleDisplayButton}>
          {displayInfo ? (
            <IoChevronUpCircleOutline size={23} />
          ) : (
            <MdOutlineExpandCircleDown size={23} />
          )}{' '}
          Shopping Cart Details
        </button>
        {displayInfo && (
          <div className={styles.expand}>
            <div className={styles.credentials}>
              <div className={styles.supplier}>
                <div className={styles.title}>Supplier headers</div>
                <div>Credentials: {supplierDomain}</div>
                <div>
                  Supplier Identity:{' '}
                  {cXML.Header[0].From[0].Credential[0].Identity[0]}
                </div>
              </div>
              <div className={styles.buyer}>
                <div className={styles.title}>Buyers headers</div>
                <div>Credentials: {buyerDomain}</div>
                <div>
                  Buyer Identity:{' '}
                  {cXML.Header[0].To[0].Credential[0].Identity[0]}
                </div>
              </div>
              <div className={styles.sender}>
                <div className={styles.title}>Sender headers</div>
                <div>
                  Sender Identity:{' '}
                  {cXML.Header[0].Sender[0].Credential[0].Identity[0]}
                </div>
                <div>User Agent: {cXML.Header[0].Sender[0].UserAgent[0]}</div>
              </div>
              <div className={styles.cartInfo}>
                <div className={styles.title}>cXML details</div>
                <div className={styles.payload}>
                  Payload ID: {cXML.$.payloadID}
                </div>
                <div className={styles.timestamp}>
                  Timestamp: {cXML.$.timestamp}
                </div>
              </div>
            </div>
            <div
              className={styles.cXMLContainer}
              onDoubleClick={handleDisplayXML}
            >
              {displayXML ? (
                <pre className={styles.cXML}>
                  {xmlToJSX(
                    new DOMParser().parseFromString(xmlData, 'application/xml')
                      .documentElement
                  )}
                </pre>
              ) : (
                <button className={styles.cXMLButton}>
                  <MdOutlineExpandCircleDown size={23} />
                  <div>Show cXML version</div>
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
                const unitPrice = parseFloat(
                  item.ItemDetail[0].UnitPrice[0].Money[0]._
                ); // Ensure this matches the XML structure
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
                <td colSpan="7" className={styles.totalPrice}>
                  Total Cart Price
                </td>
                <td>
                  <strong>
                    {totalCartPrice.toFixed(2)} {currencySymbol}
                  </strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles.btnContainer}>
          <button className={styles.btnPO} onClick={handleInfoMessage}>
            Create PO
          </button>
        </div>
        {infoMessage && (
          <div className={styles.infoBox}>
            <FcInfo />
            {infoMessage}
          </div>
        )}
      </Suspense>
    </div>
  );
};

export default DisplayCxmlCart;
