'use client';
import styles from './hero.module.css'


const Hero = () => {
  return (
    <div className={styles.container}>
        <div className={styles.first}>
            
            <div className={styles.card}>
                <div className={styles.title}>
                            What is PunchOut ? 
                </div>
                <div className={styles.content}>
                            PunchOut refers to a technology used in e-procurement systems that allows buyers to access suppliers&apos; catalogs directly from their own procurement application. <br/><br/>This seamless integration facilitates a streamlined purchasing process, where users can PuchOut from their procurement system to the supplier&apos;s website, select items, and return the shopping cart back to their procurement system for approval and order placement.
                </div>
            </div>
            
        </div>
        <div className={styles.second}>
            <div className={styles.bgImg}>
                <div className={styles.card}>
                    <div className={styles.title}>
                            Welcome to PunchOut Test Tool
                    </div>
                    <div className={styles.content}>
                            At PunchOut Test Tool, our mission is to provide an unparalleled platform for testing and validating PunchOut catalog integrations, ensuring a seamless and efficient procurement experience for businesses and their suppliers.<br/><br/>
                            PunchOut Test Tool is empowering Seamless E-Procurement Integration through Comprehensive PunchOut Testing Solutions.<br/><br/>
                            By dedicating ourselves to these principles, PunchOut Test aims to be the trusted partner for businesses looking to optimize their e-procurement systems and achieve seamless PunchOut integration.
                    </div>
                </div>
            </div>
        </div>
        <div className={styles.third}>
            <div className={styles.bgImg}>
                <div className={styles.card}>
                     <div className={styles.title}>
                            Do you want to learn more ?
                     </div>
                     <div className={styles.content}>
                            At PunchOut Test Tool, our mission is to provide an unparalleled platform for testing and validating PunchOut catalog integrations, ensuring a seamless and efficient procurement experience for businesses and their suppliers.
                            <br/><br/>
                            At PunchOut Test Tool, our mission is to provide an unparalleled platform for testing and validating PunchOut catalog integrations, ensuring a seamless and efficient procurement experience for businesses and their suppliers.
                    </div>
                 </div>
            </div>
        </div>
        <div className={styles.fourth}>
            <div className={styles.bgImg}>
                <div className={styles.card}>
                     <div className={styles.title}>
                            Enroll in our Punchout courses
                     </div>
                     <div className={styles.content}>
                            At PunchOut Test Tool, our mission is to provide an unparalleled platform for testing and validating PunchOut catalog integrations, ensuring a seamless and efficient procurement experience for businesses and their suppliers.
                            <br/><br/>
                            Our mission is to provide an unparalleled platform for testing and validating PunchOut catalog integrations, ensuring a seamless and efficient procurement experience for businesses and their suppliers.
                    </div>
                 </div>
            </div>
        </div>
    </div>
  )
}

export default Hero