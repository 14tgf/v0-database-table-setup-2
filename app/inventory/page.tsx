import Link from 'next/link';

export const metadata = {
  title: 'Inventory | X-Holding',
  description: 'Browse Tesla vehicles, energy systems, and robotics products',
};

export default function InventoryPage() {
  return (
    <main className="w-full min-h-screen relative">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/tesla-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/70" />
      <div className="absolute inset-0 opacity-5">
        <div
          style={{
            backgroundImage:
              'linear-gradient(rgba(0, 217, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 217, 255, 0.3) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/"
              className="text-accent hover:text-accent/80 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>

          <div className="space-y-6 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              Product Inventory
            </h1>
            <p className="text-xl text-white/60">
              Complete product catalog with purchasing options
            </p>
            <div className="mt-12 p-12 rounded-xl border border-accent/30 bg-secondary/30">
              <div className="inline-block">
                <div className="text-accent text-6xl mb-4">🛒</div>
                <p className="text-white/60 text-lg">
                  Full inventory page coming soon with product details, reviews, filtering, and checkout
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
