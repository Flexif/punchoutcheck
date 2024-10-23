'use client';
import MenuLinks from './menuLinks/MenuLinks';
import styles from './navbar.module.css';
import { v4 as uuid } from 'uuid';
import { HiOutlineCodeBracketSquare } from "react-icons/hi2";
import { PiArrowSquareRightLight } from "react-icons/pi";
import { CiViewList } from "react-icons/ci";
import { PiFrameCorners } from "react-icons/pi";
import { RiHomeLine } from "react-icons/ri";
import Image from 'next/image';

const Navbar = () => {

  const navbarLinks = [
    {
      id: uuid(), // Assign a UUID to each object
      title: 'Main',
      path: '/main',
      icon: <RiHomeLine size={25}/>
    },
    {
      id: uuid(), // Assign a UUID to each object
      title: 'cXML Punchout',
      path: '/main/cxml-test-tool',
      icon: <HiOutlineCodeBracketSquare size={25}/>
    },
    {
      id: uuid(),
      title: 'OCI Punchout',
      path: '/main/oci-test-tool',
      icon: <PiArrowSquareRightLight size={25}/>
    },
    {
      id: uuid(),
      title: 'Check Headers',
      path: '/main/check-headers',
      icon: <CiViewList size={25}/>
    },
    {
      id: uuid(),
      title: 'Iframe Test',
      path: '/main/check-iframe',
      icon: <PiFrameCorners size={25}/>
    }
  ];
  
  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <div className={styles.logoContainer}>
          <Image src='/Vurbis.png' width={45} height={38} alt='logo' className={styles.img}/>
          </div>
      </div>
      <div className={styles.links}>
        {navbarLinks.map((link)=>(
          <MenuLinks link={link} key={link.id} className={styles.title}/>
        ))}
      </div>
    </div>
  )
}

export default Navbar