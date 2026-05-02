'use client'

import { useEffect, useState } from 'react'

interface CounterProps {
  target: number
  duration?: number
  suffix?: string
}

export function AnimatedCounter({ target, duration = 2000, suffix = '' }: CounterProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const elapsed = currentTime - startTime

      if (elapsed < duration) {
        const progress = elapsed / duration
        setCount(Math.floor(target * progress))
        animationFrame = requestAnimationFrame(animate)
      } else {
        setCount(target)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrame)
  }, [target, duration])

  return (
    <span>
      {count}
      {suffix}
    </span>
  )
}
