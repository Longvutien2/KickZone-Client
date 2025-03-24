import Head from 'next/head'
import React from 'react'

export type LayoutProps = {
    children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div>
            <Head>
                <link rel="shortcut icon" href="/icon.png" type="image/x-icon" />
            </Head>
            {children}
            {/* <Navbar />
            <Footer /> */}
        </div>
    )
}

export default Layout