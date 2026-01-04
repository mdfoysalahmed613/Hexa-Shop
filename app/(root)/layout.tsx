
import React from 'react'
import { Navbar } from './_components/navbar'

const layout = ({ children }: { children: React.ReactNode }) => {
   return (
      <>
         <Navbar />
         {children}
      </>
   )
}

export default layout