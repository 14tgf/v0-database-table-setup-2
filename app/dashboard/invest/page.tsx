'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bell, Sun, TrendingUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { SidebarMenu } from '@/components/dashboard/sidebar-menu';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';

interface InvestmentPlan {
  id: string;
  name: string;
  category: string;
  nav: string;
  return: string;
  min: string;
  risk: 'High' | 'Medium' | 'Low';
}

const allPlans: InvestmentPlan[] = [
  { id: '1', name: 'Aggressive Growth Fund', category: 'Growth', nav: '$32.4000', return: '+0.00%', min: '$200', risk: 'High' },
  { id: '2', name: 'Conservative Bond Fund', category: 'Conservative', nav: '$10.4500', return: '+0.00%', min: '$750', risk: 'Low' },
  { id: '3', name: 'Conservative Income Fund', category: 'Income', nav: '$12.8000', return: '+0.00%', min: '$500', risk: 'Low' },
  { id: '4', name: 'Dividend Income Fund', category: 'Income', nav: '$14.6000', return: '+0.00%', min: '$1,000', risk: 'Medium' },
  { id: '5', name: 'ESG Balanced Fund', category: 'Balanced', nav: '$22.1500', return: '+0.00%', min: '$150', risk: 'Medium' },
  { id: '6', name: 'Global Growth Fund', category: 'Growth', nav: '$19.8000', return: '+0.00%', min: '$400', risk: 'Medium' },
  { id: '7', name: 'Sustainable Energy ETF', category: 'ESG', nav: '$18.7500', return: '+0.00%', min: '$50', risk: 'Medium' },
  { id: '8', name: 'Tesla Technology Fund', category: 'Tesla-Focused', nav: '$28.9000', return: '+0.00%', min: '$300', risk: 'High' },
  { id: '9', name: 'Tesla Growth Fund', category: 'Tesla-Focused', nav: '$35.5000', return: '+9.23%', min: '$100', risk: 'High' },
  { id: '10', name: 'Tesla Retirement Fund', category: 'Conservative', nav: '$15.2000', return: '+0.00%', min: '$250', risk: 'Low' },
];

const featuredPlans = allPlans.slice(0, 3);

export default function InvestPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const plansPerPage = 3;

  // Filter plans based on search and risk selection
  const filteredPlans = allPlans.filter((plan) => {
    const matchesSearch = plan.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         plan.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = selectedRisk === 'All' || plan.risk === selectedRisk;
    return matchesSearch && matchesRisk;
  });

  const totalPages = Math.ceil(filteredPlans.length / plansPerPage);
  const startIdx = (currentPage - 1) * plansPerPage;
  const endIdx = startIdx + plansPerPage;
  const displayedPlans = filteredPlans.slice(startIdx, endIdx);

  // Reset to page 1 when search/filter changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleRiskChange = (risk: 'All' | 'High' | 'Medium' | 'Low') => {
    setSelectedRisk(risk);
    setCurrentPage(1);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-gradient-to-r from-background/95 via-background/85 to-background/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-3 py-3 sm:px-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Image 
              src="/logo.png" 
              alt="X Holding" 
              width={80} 
              height={40}
              className="w-auto h-10 cursor-pointer hover:opacity-80 transition-opacity"
            />
          </Link>
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-3 py-4 sm:px-4 lg:px-6">
        {/* Hero Section */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-4 sm:p-5 backdrop-blur-xl">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Investment Plans</h1>
          <p className="text-white/70 text-xs sm:text-sm mb-4">Discover and invest in diversified portfolios designed for growth</p>
          
          {/* Stats Card */}
          <div className="rounded-xl border border-white/20 bg-white/5 p-3 backdrop-blur-sm">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-white/60 text-xs mb-1">Available Plans</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{allPlans.length}</p>
              </div>
              <div>
                <p className="text-white/60 text-xs mb-1">Categories</p>
                <p className="text-xl sm:text-2xl font-bold text-white">6</p>
              </div>
              <div>
                <p className="text-white/60 text-xs mb-1">Featured</p>
                <p className="text-xl sm:text-2xl font-bold text-white">3</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 backdrop-blur-xl overflow-hidden">
          <button 
            onClick={() => setSearchOpen(!searchOpen)}
            className="w-full p-3 sm:p-4 flex items-center gap-3 hover:bg-white/5 transition-colors"
          >
            <svg className="w-4 h-4 text-white/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="text-white font-medium text-sm flex-1 text-left">Search & Filters</span>
            <ChevronDown className={`w-4 h-4 text-white/60 flex-shrink-0 transition-transform ${searchOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Search Panel */}
          {searchOpen && (
            <div className="border-t border-white/10 p-3 sm:p-4 space-y-4">
              {/* Search Input */}
              <div>
                <label className="text-white/70 text-xs font-medium mb-2 block">Search by name or category</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="e.g., Tesla, Growth, Conservative..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              {/* Risk Filter */}
              <div>
                <label className="text-white/70 text-xs font-medium mb-2 block">Filter by Risk Level</label>
                <div className="flex flex-wrap gap-2">
                  {(['All', 'High', 'Medium', 'Low'] as const).map((risk) => (
                    <button
                      key={risk}
                      onClick={() => handleRiskChange(risk)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedRisk === risk
                          ? 'bg-primary text-background border border-primary'
                          : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20'
                      }`}
                    >
                      {risk}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results Info */}
              <div className="text-white/60 text-xs">
                Showing {filteredPlans.length} of {allPlans.length} plans
              </div>
            </div>
          )}
        </div>

        {/* Featured Plans */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg sm:text-xl font-bold text-white">Featured Plans</h2>
            <a href="#" className="text-primary hover:text-primary/80 transition-colors text-xs sm:text-sm font-medium flex items-center gap-1">
              View All <span>→</span>
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {featuredPlans.map((plan) => (
              <div key={plan.id} className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-3 sm:p-4 backdrop-blur-xl glow-cyan-hover">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2">{plan.name}</h3>
                    <p className="text-white/60 text-xs">{plan.category}</p>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ml-2 ${getRiskColor(plan.risk)}`}>
                    {plan.risk}
                  </div>
                </div>
                <div className="space-y-1.5 mb-3">
                  <div className="flex justify-between">
                    <span className="text-white/70 text-xs">Current NAV:</span>
                    <span className="text-white font-semibold text-xs">{plan.nav}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70 text-xs">1Y Return:</span>
                    <span className="text-green-400 font-semibold text-xs">{plan.return}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70 text-xs">Min Investment:</span>
                    <span className="text-white font-semibold text-xs">{plan.min}</span>
                  </div>
                </div>
                <button className="w-full bg-white text-background px-2 py-1.5 rounded-lg font-medium text-xs hover:bg-white/90 transition-colors">
                  Invest Now
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* All Investment Plans */}
        <div className="mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-1">All Investment Plans</h2>
          <p className="text-white/60 text-xs sm:text-sm mb-4">Showing {displayedPlans.length > 0 ? startIdx + 1 : 0} of {filteredPlans.length} plans</p>

          {displayedPlans.length > 0 ? (
            <>
              <div className="space-y-3 mb-6">
                {displayedPlans.map((plan) => (
                  <div key={plan.id} className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-3 sm:p-4 backdrop-blur-xl glow-cyan-hover">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2">{plan.name}</h3>
                        <p className="text-white/60 text-xs">{plan.category}</p>
                      </div>
                      <div className={`px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ml-2 ${getRiskColor(plan.risk)}`}>
                        {plan.risk}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                      <div>
                        <p className="text-white/70 text-xs mb-0.5">NAV:</p>
                        <p className="text-white font-semibold text-xs">{plan.nav}</p>
                      </div>
                      <div>
                        <p className="text-white/70 text-xs mb-0.5">Return:</p>
                        <p className="text-green-400 font-semibold text-xs">{plan.return}</p>
                      </div>
                      <div>
                        <p className="text-white/70 text-xs mb-0.5">Min:</p>
                        <p className="text-white font-semibold text-xs">{plan.min}</p>
                      </div>
                      <div className="flex items-end">
                        <button className="w-full bg-white text-background px-2 py-1.5 rounded-lg font-medium text-xs hover:bg-white/90 transition-colors">
                          Invest
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-white/20 bg-white/5 text-white/60 hover:text-white hover:border-white/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs sm:text-sm font-medium"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>
                <span className="text-white/60 text-xs">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-white/20 bg-white/5 text-white/60 hover:text-white hover:border-white/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs sm:text-sm font-medium"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-6 text-center backdrop-blur-xl">
              <p className="text-white/60 text-sm">No plans found matching your search. Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </main>

      {/* Sidebar Menu */}
      <SidebarMenu 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Bottom Navigation */}
      <DashboardNav />
    </div>
  );
}
