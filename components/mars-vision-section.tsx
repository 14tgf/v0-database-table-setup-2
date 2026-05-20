'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

export function MarsVisionSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    videoRef.current.requestFullscreen();
  };

  const handleWatchClick = () => {
    setShowVideo(true);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }, 100);
  };

  return (
    <section className="relative w-full mt-16 mb-8 overflow-hidden rounded-2xl border border-white/10">
      {/* Background: Mars image */}
      <div className="absolute inset-0 -z-0">
        <Image
          src="/mars-starship.jpg"
          alt="SpaceX Starship orbiting Mars"
          fill
          className="object-cover"
          sizes="100vw"
        />
        {/* Dark gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
      </div>

      <div className="relative z-10 px-6 py-14 md:px-12 md:py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          {/* Left — Copy */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm w-fit">
              <span className="w-2 h-2 rounded-full bg-[#00d9ff] animate-pulse" />
              <span className="text-xs font-semibold tracking-widest text-[#00d9ff] uppercase">The Future Is Now</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight text-balance">
              Beyond Earth.<br />
              <span className="text-[#00d9ff]">Beyond Limits.</span>
            </h2>

            <p className="text-sm md:text-base text-white/70 leading-relaxed max-w-lg">
              Elon Musk&apos;s SpaceX Starship is rewriting the rules of human civilisation — from the streets of Earth to the surface of Mars. As the world&apos;s most ambitious aerospace programme accelerates, X-Holdings positions investors at the forefront of this revolution. The companies shaping interplanetary travel are the same companies powering the products you trade here every day.
            </p>

            <p className="text-sm text-white/60 leading-relaxed max-w-lg">
              Tesla, SpaceX, Neuralink and xAI are not separate ventures — they are a single, interconnected vision for humanity&apos;s future. When you invest through X-Holdings, you are not just trading products. You are staking a claim in the most consequential technological epoch in history.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              {[
                { label: 'Starship Launches', value: '6+' },
                { label: 'Mars Target', value: '2026' },
                { label: 'Valuation', value: '$350B+' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-5 py-3 text-center">
                  <div className="text-xl font-bold text-[#00d9ff]">{stat.value}</div>
                  <div className="text-xs text-white/60 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Video Player */}
          <div className="relative rounded-xl overflow-hidden border border-white/20 shadow-2xl shadow-black/50 aspect-video bg-black">
            {/* Video element */}
            <video
              ref={videoRef}
              src="/spacex-video.mov"
              muted={isMuted}
              loop
              playsInline
              className="w-full h-full object-cover"
              onEnded={() => setIsPlaying(false)}
            />

            {/* Thumbnail overlay before play */}
            {!showVideo && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                <Image
                  src="/mars-starship.jpg"
                  alt="SpaceX Starship video thumbnail"
                  fill
                  className="object-cover opacity-50"
                />
                <button
                  onClick={handleWatchClick}
                  className="relative z-10 flex flex-col items-center gap-3 group"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#00d9ff]/20 border-2 border-[#00d9ff] flex items-center justify-center group-hover:bg-[#00d9ff]/40 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-[#00d9ff]/30">
                    <Play className="w-7 h-7 md:w-9 md:h-9 text-white fill-white ml-1" />
                  </div>
                  <span className="text-white/80 text-sm font-medium tracking-wide">Watch the Vision</span>
                </button>
              </div>
            )}

            {/* Controls bar — shown after video starts */}
            {showVideo && (
              <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 px-4 py-3 bg-gradient-to-t from-black/80 to-transparent">
                <button
                  onClick={handlePlayPause}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  {isPlaying
                    ? <Pause className="w-4 h-4 text-white" />
                    : <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                  }
                </button>
                <button
                  onClick={handleMute}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  {isMuted
                    ? <VolumeX className="w-4 h-4 text-white" />
                    : <Volume2 className="w-4 h-4 text-white" />
                  }
                </button>
                <div className="flex-1" />
                <button
                  onClick={handleFullscreen}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <Maximize className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
