'use client';

import Image from 'next/image';

interface CompanyLogoProps {
  logo: string;
  name: string;
  symbol: string;
}

function getInitials(name: string, symbol: string): string {
  if (name && name.length > 0) {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  return symbol.slice(0, 2);
}

export function CompanyLogo({ logo, name, symbol }: CompanyLogoProps) {
  // If logo exists, render it
  if (logo) {
    return (
      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-white/10">
        <Image
          src={logo}
          alt={name || symbol}
          fill
          className="object-cover"
          sizes="40px"
          onError={(e) => {
            // Fallback to initials if image fails to load
            e.currentTarget.style.display = 'none';
          }}
        />
        {/* Fallback initials - shown if image fails */}
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500/80 to-purple-500/80 text-xs font-bold text-white">
          {getInitials(name, symbol)}
        </div>
      </div>
    );
  }

  // Fallback to initials avatar
  const initials = getInitials(name, symbol);
  return (
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/80 to-purple-500/80 text-xs font-bold text-white">
      {initials}
    </div>
  );
}
