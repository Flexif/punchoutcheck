'use client';
import Image from 'next/image';
import styles from './hero.module.css';

const Hero = () => {
  return (
    <div className={styles.container}>
      <div className={styles.first}>
        <div className={styles.card}>
          <div className={styles.content}>
            <div className={styles.top}>
              <div className={styles.header}>Our Mission</div>
              <div className={styles.context}>
                To empower businesses with a seamless, reliable, and efficient
                punchout testing tool that simplifies e-procurement
                integrations, ensuring accuracy, speed, and enhanced user
                experiences for suppliers and buyers alike.
              </div>
            </div>
            <div className={styles.mottoBox}>
              <div className={styles.motto}>First Test, Then Rest.</div>
            </div>
            <div className={styles.bottom}>
              <div className={styles.header}>Our Vision</div>
              <div className={styles.context}>
                To become the leading solution for punchout testing,
                revolutionizing e-procurement workflows by fostering innovation,
                trust, and unparalleled connectivity across global supply
                chains.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
