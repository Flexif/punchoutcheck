import React from 'react'
import Navbar from '../ui/main/navbar/Navbar'
import styles from '../ui/main/main.module.css'

const layout = ({children}) => {
  return (
    <div className={styles.container}>
        <div className={styles.navbar}>
            <Navbar/>
        </div>
        <div className={styles.content}>
          <div className={styles.opacity}>
               {children}
          </div>
        </div>
        <div className={styles.footer}>
          <div>Punchout Test Tool</div>
          <div> © 2024 Test Tool. All rights reserved by VURBIS. </div>
        </div>
    </div>
  )
}

export default layout