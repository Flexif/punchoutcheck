'use client';
import Link from 'next/link';
import styles from './menuLinks.module.css';
import { usePathname } from 'next/navigation';

const MenuLinks = ({link}) => {
const pathname = usePathname()

  return (
    <Link href={link.path} className={`${styles.title} ${pathname === link.path && styles.active}`}>
        {link.icon}
        {link.title}
    </Link>
  )
}

export default MenuLinks