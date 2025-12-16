import React from 'react'
import Image from 'next/image'
import { FooterLogo } from '../Reusable/Images'
import Link from 'next/link'
import ContainerLayout from '@/layout/ContainerLayout'


const FooterLinks = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Use' },

]

const Footer = () => {

  const currentYear = new Date().getFullYear()

  return (
    <ContainerLayout>
      <Image src={FooterLogo} alt='Footer Logo' />
      <hr className='my-4 border-primary border-1.5' />
      <div className='flex md:flex-row flex-col justify-between pt-5'>
        <h1 className='heading md:text-2xl text-center text-primary '>@ {currentYear} All Rights Reserved</h1>
        <div className='flex md:flex-row flex-col items-center  md:gap-6'>
          {FooterLinks.map((link) => (
            <Link key={link.href} href={link.href} className='heading md:text-2xl text-md text-primary hover:text-primary/90'>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </ContainerLayout>
  )
}

export default Footer