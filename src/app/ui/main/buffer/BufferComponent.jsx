'use client';
import styles from './bufferComponent.module.css';

const Buffering = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.spinner}></div>
      <div className={styles.text}>Connecting</div>
    </div>
  );
};

export default Buffering;
