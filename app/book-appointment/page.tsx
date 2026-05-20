'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, CheckCircle, Ticket,
  User, MapPin, Briefcase, CreditCard, Copy, Check,
} from 'lucide-react';
import { CryptoForm } from '@/components/payments/crypto-form';
import { PayPalForm } from '@/components/payments/paypal-form';
import { BankForm } from '@/components/payments/bank-form';

const APPOINTMENT_FEE = 50000;

const STEPS = [
  { id: 1, label: 'Your Details', icon: User },
  { id: 2, label: 'Qualification', icon: Ticket },
  { id: 3, label: 'Payment', icon: CreditCard },
  { id: 4, label: 'Confirmed', icon: CheckCircle },
];

type PaymentMethod = 'crypto' | 'paypal' | 'bank';

export default function BookAppointmentPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [copiedTicket, setCopiedTicket] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('crypto');

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    occupation: '',
    company: '',
    purpose: '',
    preferredDate: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/appointments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setTicketNumber(data.ticketNumber);
      setStep(2);
    } catch (err) {
      alert('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSubmit = async (paymentData: any) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/appointments/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketNumber,
          paymentMethod: selectedPayment,
          paymentReference: paymentData.transactionReference || paymentData.txHash || '',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setStep(4);
    } catch (err) {
      alert('Payment submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyTicket = () => {
    navigator.clipboard.writeText(ticketNumber);
    setCopiedTicket(true);
    setTimeout(() => setCopiedTicket(false), 2000);
  };

  const inputClass =
    'w-full px-4 py-3 bg-secondary/60 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors';
  const labelClass = 'block text-xs font-semibold text-muted-foreground mb-1.5 tracking-wide uppercase';

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/mars-starship.jpg"
          alt="Mars background"
          fill
          className="object-cover opacity-10"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background" />
      </div>
      <div className="fixed inset-0 opacity-5 -z-10"
        style={{ backgroundImage: 'linear-gradient(rgba(0,217,255,0.3) 1px, transparent 1px), linear-gradient(90deg,rgba(0,217,255,0.3) 1px,transparent 1px)', backgroundSize: '60px 60px' }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <Image src="/logo.png" alt="X-Holdings" width={80} height={32} className="h-8 w-auto" />
        <div className="text-xs text-muted-foreground hidden md:block">Appointment Fee: <span className="text-accent font-bold">${APPOINTMENT_FEE.toLocaleString()}</span></div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/30 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-accent tracking-widest">EXCLUSIVE ACCESS</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-3 text-balance">
            Book a Private Appointment<br />
            <span className="text-accent">with Elon Musk</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">
            Gain rare, direct access to one of the world&apos;s most influential visionaries. Submit your details to begin the qualification process for this exclusive session.
          </p>
        </motion.div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <div key={s.id} className="flex items-center">
                <div className={`flex flex-col items-center gap-1`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isDone ? 'bg-accent border-accent text-background' :
                    isActive ? 'border-accent bg-accent/10 text-accent' :
                    'border-border bg-secondary/40 text-muted-foreground'
                  }`}>
                    {isDone ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${isActive ? 'text-accent' : isDone ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-12 md:w-20 h-px mx-1 mb-4 transition-all duration-500 ${step > s.id ? 'bg-accent' : 'bg-border'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Cards */}
        <AnimatePresence mode="wait">

          {/* STEP 1 — Personal Details */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="font-bold text-foreground text-lg">Your Information</h2>
                    <p className="text-xs text-muted-foreground">All fields marked * are required</p>
                  </div>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Full Name *</label>
                      <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="John Doe" className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}>Email Address *</label>
                      <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}>Phone Number *</label>
                      <input name="phone" value={form.phone} onChange={handleChange} placeholder="+1 234 567 8900" className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}>Occupation *</label>
                      <input name="occupation" value={form.occupation} onChange={handleChange} placeholder="CEO, Investor, Engineer..." className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}>Company / Organization</label>
                      <input name="company" value={form.company} onChange={handleChange} placeholder="Your company name" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Preferred Date</label>
                      <input type="date" name="preferredDate" value={form.preferredDate} onChange={handleChange} className={inputClass} />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Street Address *</label>
                    <input name="address" value={form.address} onChange={handleChange} placeholder="123 Main Street" className={inputClass} required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>City *</label>
                      <input name="city" value={form.city} onChange={handleChange} placeholder="New York" className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}>Country *</label>
                      <input name="country" value={form.country} onChange={handleChange} placeholder="United States" className={inputClass} required />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Purpose of Appointment *</label>
                    <textarea
                      name="purpose"
                      value={form.purpose}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Describe what you would like to discuss with Elon Musk and why you believe this meeting would be mutually valuable..."
                      className={`${inputClass} resize-none`}
                      required
                    />
                  </div>

                  {/* Fee Notice */}
                  <div className="flex items-start gap-3 p-4 bg-accent/5 border border-accent/20 rounded-xl">
                    <CreditCard className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Appointment Fee: <span className="text-accent">${APPOINTMENT_FEE.toLocaleString()}</span></p>
                      <p className="text-xs text-muted-foreground mt-0.5">A non-refundable qualification and appointment fee. Payment is collected after ticket issuance.</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-accent text-background font-bold rounded-xl hover:bg-accent/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isSubmitting ? 'Processing...' : (<>Submit Application <ArrowRight className="w-4 h-4" /></>)}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* STEP 2 — Ticket & Qualification */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto mb-5">
                  <Ticket className="w-8 h-8 text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Application Received</h2>
                <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                  Your application has been submitted successfully. Your qualification ticket has been generated below.
                </p>

                {/* Ticket */}
                <div className="relative bg-secondary/60 border-2 border-dashed border-accent/40 rounded-2xl p-6 mb-6 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
                  <p className="text-xs text-muted-foreground tracking-widest uppercase mb-2">Your Ticket Number</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl md:text-3xl font-mono font-bold text-accent tracking-wider">{ticketNumber}</span>
                    <button onClick={copyTicket} className="p-2 bg-accent/10 hover:bg-accent/20 rounded-lg transition-colors">
                      {copiedTicket ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4 text-accent" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">Save this number — you will need it for payment and follow-up</p>
                </div>

                {/* Qualification Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
                  {[
                    { label: 'Application Status', value: 'Qualified', color: 'text-green-400' },
                    { label: 'Appointment Fee', value: `$${APPOINTMENT_FEE.toLocaleString()}`, color: 'text-accent' },
                    { label: 'Payment Status', value: 'Pending', color: 'text-yellow-400' },
                  ].map((item) => (
                    <div key={item.label} className="bg-background/60 border border-border rounded-xl p-4">
                      <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                      <p className={`font-bold text-sm ${item.color}`}>{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-green-400/5 border border-green-400/20 rounded-xl text-left mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">You are Qualified to Proceed</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Congratulations, <span className="text-foreground font-medium">{form.fullName}</span>. Your profile meets the eligibility criteria for a private appointment. Complete payment to confirm your slot.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setStep(3)}
                  className="w-full py-3.5 bg-accent text-background font-bold rounded-xl hover:bg-accent/90 transition-all flex items-center justify-center gap-2"
                >
                  Proceed to Payment <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3 — Payment */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="font-bold text-foreground text-lg">Complete Payment</h2>
                    <p className="text-xs text-muted-foreground">Ticket: <span className="font-mono text-accent">{ticketNumber}</span></p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xs text-muted-foreground">Amount Due</p>
                    <p className="text-xl font-bold text-accent">${APPOINTMENT_FEE.toLocaleString()}</p>
                  </div>
                </div>

                <div className="h-px bg-border my-5" />

                {/* Payment Method Tabs */}
                <div className="flex gap-2 mb-6">
                  {(['crypto', 'paypal', 'bank'] as PaymentMethod[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setSelectedPayment(m)}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold capitalize border transition-all ${
                        selectedPayment === m
                          ? 'bg-accent/10 border-accent text-accent'
                          : 'bg-secondary/40 border-border text-muted-foreground hover:border-accent/50'
                      }`}
                    >
                      {m === 'crypto' ? 'Crypto' : m === 'paypal' ? 'PayPal' : 'Bank Transfer'}
                    </button>
                  ))}
                </div>

                {/* Render existing payment forms — amount pre-filled */}
                {selectedPayment === 'crypto' && (
                  <CryptoForm
                    type="deposit"
                    onSubmit={handlePaymentSubmit}
                    autoAmount={APPOINTMENT_FEE}
                  />
                )}
                {selectedPayment === 'paypal' && (
                  <PayPalForm
                    type="deposit"
                    onSubmit={handlePaymentSubmit}
                  />
                )}
                {selectedPayment === 'bank' && (
                  <BankForm
                    onSubmit={handlePaymentSubmit}
                  />
                )}

                <button
                  onClick={() => setStep(2)}
                  className="mt-4 w-full py-2.5 border border-border text-muted-foreground text-sm rounded-xl hover:border-accent/40 hover:text-foreground transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Ticket
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4 — Confirmed */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <div className="bg-card border border-border rounded-2xl p-8 md:p-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-green-400/10 border-2 border-green-400/30 flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </motion.div>

                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Payment Submitted!</h2>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6 leading-relaxed">
                  Your appointment request and payment have been received. Our team will review and confirm your booking within 24–48 hours.
                </p>

                <div className="bg-secondary/60 border border-border rounded-xl p-5 mb-6 inline-block w-full max-w-sm">
                  <p className="text-xs text-muted-foreground mb-1 tracking-widest uppercase">Confirmation Ticket</p>
                  <p className="font-mono font-bold text-accent text-xl tracking-wider">{ticketNumber}</p>
                  <p className="text-xs text-muted-foreground mt-2">A confirmation email will be sent to <span className="text-foreground">{form.email}</span></p>
                </div>

                <div className="space-y-3">
                  <Link
                    href="/"
                    className="block w-full py-3 bg-accent text-background font-bold rounded-xl hover:bg-accent/90 transition-all text-sm"
                  >
                    Return to Homepage
                  </Link>
                  <Link
                    href="/login"
                    className="block w-full py-3 border border-border text-muted-foreground rounded-xl hover:border-accent/40 hover:text-foreground transition-all text-sm"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  );
}
