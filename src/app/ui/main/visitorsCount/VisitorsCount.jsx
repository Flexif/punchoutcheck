'use client';
import { useEffect, useState } from 'react';
import { IoPeopleSharp } from 'react-icons/io5';
import styles from './visitorsCount.module.css';

const VisitorCount = () => {
  const backendURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || '';
  const [visitorCount, setVisitorCount] = useState(null); // Initialize as null

  useEffect(() => {
    // Retrieve visitor count from localStorage on client-side only
    if (typeof window !== 'undefined') {
      const savedCount = localStorage.getItem('visitorCount');
      if (savedCount) setVisitorCount(parseInt(savedCount, 10));
    }

    // Fetch the latest visitor count from the server
    const fetchVisitorCount = async () => {
      try {
        const response = await fetch(`${backendURL}/api/visitor-count`);
        const data = await response.json();
        setVisitorCount(data.count);

        // Save latest count to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('visitorCount', data.count);
        }
      } catch (error) {
        console.error('Failed to fetch visitor count:', error);
      }
    };

    fetchVisitorCount();
  }, []);

  return (
    <div className={styles.container}>
      <IoPeopleSharp size={20} className={styles.icon} />
      <div className={styles.counts}>
        {visitorCount !== null ? visitorCount : <div></div>}
      </div>
    </div>
  );
};

export default VisitorCount;
