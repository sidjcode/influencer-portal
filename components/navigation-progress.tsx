"use client"

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import NProgress from 'nprogress'

export default function NavigationProgress() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        NProgress.configure({ showSpinner: false })
    }, [])

    useEffect(() => {
        NProgress.done()
        return () => {
            NProgress.start()
        }
    }, [pathname, searchParams])

    return null
}