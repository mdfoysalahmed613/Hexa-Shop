import { Navbar } from '@/components/home/navbar/navbar'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
   return (
      <>
         <Navbar />
         {children}
      </>
   )
}

export default layout