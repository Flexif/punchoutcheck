'use client';
import MenuLinks from './menuLinks/MenuLinks';
import styles from './navbar.module.css';
import { v4 as uuid } from 'uuid';
import { HiOutlineCodeBracketSquare } from 'react-icons/hi2';
import { PiArrowSquareRightLight } from 'react-icons/pi';
import { CiViewList } from 'react-icons/ci';
import { PiFrameCorners } from 'react-icons/pi';
import { RiHomeLine } from 'react-icons/ri';
import Image from 'next/image';

const Navbar = () => {
  const navbarLinks = [
    {
      id: uuid(),
      title: 'Home', // Updated title for clarity
      path: '/', // Changed to root path
      icon: <RiHomeLine size={25} />,
    },
    {
      id: uuid(),
      title: 'cXML Punchout',
      path: '/cxml-test-tool', // Changed to reflect new structure
      icon: <HiOutlineCodeBracketSquare size={25} />,
    },
    {
      id: uuid(),
      title: 'OCI Punchout',
      path: '/oci-test-tool', // Changed to reflect new structure
      icon: <PiArrowSquareRightLight size={25} />,
    },
    {
      id: uuid(),
      title: 'Check Headers',
      path: '/check-headers', // Changed to reflect new structure
      icon: <CiViewList size={25} />,
    },
    {
      id: uuid(),
      title: 'Iframe Test',
      path: '/check-iframe', // Changed to reflect new structure
      icon: <PiFrameCorners size={25} />,
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <div className={styles.logoContainer}>
          <Image
            src="/punchout.png"
            width={50}
            height={50}
            alt="logo"
            className={styles.img}
          />
        </div>
      </div>
      <div className={styles.links}>
        {navbarLinks.map((link) => (
          <MenuLinks link={link} key={link.id} className={styles.title} />
        ))}
      </div>
    </div>
  );
};

export default Navbar;
