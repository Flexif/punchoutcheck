'use client';
import { useEffect, useState } from 'react';
import { IoPeopleSharp } from 'react-icons/io5';
import styles from './visitorsCount.module.css';

const VisitorCount = () => {
  const backendURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
  const [visitorCount, setVisitorCount] = useState(null); // Initialize as null
  const [error, setError] = useState(null); // To handle errors

  useEffect(() => {
    // Fetch the latest visitor count from the server
    const fetchVisitorCount = async () => {
      if (!backendURL) {
        console.error("Backend URL is not defined");
        return;
      }

      try {
        const response = await fetch(`${backendURL}/api/visitor-count`);
        if (response.ok) {
          const data = await response.json();
          setVisitorCount(data.count);
        } else {
          console.error('Failed to fetch visitor count');
          setError('Failed to load visitor count. Please try again later.');
        }
      } catch (error) {
        console.error('Error fetching visitor count:', error);
        setError('An error occurred while fetching visitor count.');
      }
    };

    fetchVisitorCount();
  }, [backendURL]);

  return (
    <div className={styles.container} title='Website Visitors'>
      <IoPeopleSharp size={20} className={styles.icon} />
      <div className={styles.counts}>
        {error ? (
          <span>{error}</span>
        ) : (
          visitorCount !== null ? visitorCount : <span></span>
        )}
      </div>
    </div>
  );
};

export default VisitorCount;
