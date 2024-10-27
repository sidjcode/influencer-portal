import { useState, useEffect } from 'react'
import { useSpring } from 'framer-motion'

export function useCountUp(end: number, duration: number = 2) {
    const [count, setCount] = useState(0)
    const animatedValue = useSpring(count, { duration: duration * 1000 })

    useEffect(() => {
        animatedValue.set(end)
    }, [end, animatedValue])

    useEffect(() => {
        return animatedValue.onChange(setCount)
    }, [animatedValue])

    return Math.round(count)
}