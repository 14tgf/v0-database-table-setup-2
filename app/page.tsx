'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <main className="w-full h-screen bg-gradient-to-b from-background via-background to-secondary/20 overflow-hidden">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(224, 224, 224, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(224, 224, 224, 0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center px-8 py-6">
        <div
          className={`text-2xl font-light tracking-widest transition-all duration-1000 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          MANSORY
        </div>
        <nav className="hidden md:flex gap-12 text-sm tracking-wide">
          {['MODELS', 'EXPERIENCE', 'CONTACT'].map((item, idx) => (
            <a
              key={item}
              href="#"
              className={`hover:text-accent transition-colors duration-300 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}
              style={{ transitionDelay: `${400 + idx * 100}ms` }}
            >
              {item}
            </a>
          ))}
        </nav>
      </header>

      {/* Hero Content */}
      <div className="relative z-10 h-full flex items-center justify-center px-6">
        <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text Content */}
          <div className="space-y-8">
            <div
              className={`space-y-4 transition-all duration-1000 ${
                isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
              }`}
              style={{ transitionDelay: '600ms' }}
            >
              <div className="text-accent text-sm tracking-[0.3em] font-light">
                INNOVATION & PERFORMANCE
              </div>
              <h1 className="text-5xl md:text-7xl font-light tracking-tight leading-tight">
                Creation Without Limitation
              </h1>
            </div>

            <p
              className={`text-muted-foreground text-lg max-w-md leading-relaxed transition-all duration-1000 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '800ms' }}
            >
              Experience the pinnacle of automotive engineering. Where performance meets elegance, and tradition meets innovation.
            </p>

            <div
              className={`flex gap-6 transition-all duration-1000 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '1000ms' }}
            >
              <button className="px-8 py-3 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 tracking-wide text-sm font-light">
                EXPLORE NOW
              </button>
              <button className="px-8 py-3 border border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-300 tracking-wide text-sm font-light">
                CONTACT SALES
              </button>
            </div>
          </div>

          {/* Right Side - Car Image */}
          <div
            className={`relative h-full min-h-[500px] md:min-h-[600px] transition-all duration-1000 ${
              isLoaded
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-95'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            <div className="relative w-full h-full flex items-center justify-center group">
              {/* Glow effect background */}
              <div className="absolute inset-0 bg-gradient-radial from-accent/5 via-transparent to-transparent blur-3xl group-hover:from-accent/10 transition-all duration-500" />

              {/* Car Image with Animation */}
              <div className="relative w-full h-full animate-float">
                <Image
                  src="/car.jpg"
                  alt="MANSORY Performance Vehicle"
                  fill
                  className="object-contain drop-shadow-2xl group-hover:drop-shadow-[0_0_40px_rgba(224,224,224,0.3)] transition-all duration-500"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Scroll Indicator */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-10 transition-all duration-1000 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ transitionDelay: '1200ms' }}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="text-xs tracking-[0.2em] text-muted-foreground">SCROLL TO REVEAL</div>
          <div className="w-px h-6 bg-gradient-to-b from-accent to-transparent animate-pulse" />
        </div>
      </div>
    </main>
  )
}
