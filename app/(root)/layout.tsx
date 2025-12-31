import { Navbar } from './_components/navbar/navbar'
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