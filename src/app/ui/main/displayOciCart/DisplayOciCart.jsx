'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import JSONPretty from 'react-json-pretty'; // For raw JSON display
import styles from './displayOciCart.module.css'; // Assuming styles are the same or similar to DisplayCxmlCart
import { MdOutlineExpandCircleDown } from "react-icons/md";
import { IoChevronUpCircleOutline } from "react-icons/io5";
import { FcInfo } from "react-icons/fc";

const DisplayOciCart = () => {
  const backendURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
  const [infoMessage, setInfoMessage] = useState('');
  const [displayInfo, setDisplayInfo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartData, setCartData] = useState(null);
  const searchParams = useSearchParams();
  const cartId = searchParams.get('id');

  const customTheme = {
    main: `
      line-height: 1.7;
      color: var(--textLight); 
      overflow: auto;
      padding: 1em;
      font-size: 14px;
      min-width: 100%;
    `,
    error: `
      color: var(--warn); 
      background-color: var(--bgSec);
    `,
    key: `
      color: var(--textLight);
      font-weight: 400;
    `,
    string: `
      color: var(--text);
      font-weight: 500;
    `,
    value: `
      color: var(--iconHover);
    `,
    boolean: `
      color: var(--success);
    `,
  };

  const handleInfoMessage = () => {
    setInfoMessage('A Purchase Order is created if you have a Punchout Order Request license.');
    setTimeout(() => { setInfoMessage('') }, 10000);
  };

  const handleDisplayButton = () => {
    setDisplayInfo(prev => !prev);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (cartId) {
        try {
          const response = await fetch(`${backendURL}/api/oci-data/${cartId}`);
          if (response.ok) {
            const data = await response.json();
            console.log("cartData", data);
            setCartData(data.data); // Set OCI cart data for display
          } else {
            setError('Failed to fetch data');
          }
        } catch (fetchError) {
          console.error('Fetch Error:', fetchError);
          setError('Failed to fetch data');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchData();
  }, [cartId, backendURL]);

  if (loading) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.container}>Error: {error}</div>;
  }

  if (!cartData) {
    return <div className={styles.container}>No data found.</div>;
  }

  // Extract unique keys dynamically for all items
  const uniqueKeys = Object.keys(cartData);
  const numItems = cartData[uniqueKeys[0]].length;

  // Calculate total cart price (assuming 'NEW_ITEM-PRICE' and 'NEW_ITEM-QUANTITY' exist)
  const totalCartPrice = uniqueKeys.includes('NEW_ITEM-PRICE') && uniqueKeys.includes('NEW_ITEM-QUANTITY')
    ? cartData['NEW_ITEM-PRICE'].reduce((total, price, index) => {
        const quantity = parseFloat(cartData['NEW_ITEM-QUANTITY'][index]);
        const unitPrice = parseFloat(price);
        return total + (quantity * unitPrice);
      }, 0)
    : 0;

  return (
    <div className={styles.container}>
      <button className={styles.button} onClick={handleDisplayButton}>
        {displayInfo ? <IoChevronUpCircleOutline size={23} /> : <MdOutlineExpandCircleDown size={23} />} Shopping Cart Details
      </button>
      {displayInfo ? (
        <div className={styles.expand}>
          <JSONPretty data={cartData} theme={customTheme} />
        </div>
      ) : null}

      <div>
        <h4>Items</h4>
        <table className={styles.table}>
          <thead>
            <tr>
              {uniqueKeys.map((key, index) => (
                <th key={index} className={styles.thTitles}>
                  {key.replace('NEW_ITEM-', '')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: numItems }).map((_, itemIndex) => (
              <tr key={itemIndex}>
                {uniqueKeys.map((key, keyIndex) => (
                  <td key={keyIndex}>{cartData[key]?.[itemIndex] || 'N/A'}</td>
                ))}
              </tr>
            ))}
            <tr>
              <td colSpan={uniqueKeys.length - 1} className={styles.totalPrice}>Total Cart Price</td>
              <td><strong>{totalCartPrice.toFixed(2)} {cartData['NEW_ITEM-CURRENCY']?.[0] || ''}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={styles.btnContainer}>
        <button className={styles.btnPO} onClick={handleInfoMessage}>Create PO</button>
      </div>
      {infoMessage ? <div className={styles.infoBox}><FcInfo />{infoMessage}</div> : ''}
    </div>
  );
};

export default DisplayOciCart;