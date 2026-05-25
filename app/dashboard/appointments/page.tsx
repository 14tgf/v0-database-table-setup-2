'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  User,
  MapPin,
  Briefcase,
  Calendar,
  MessageSquare,
  CreditCard,
  CheckCircle,
  Lock,
  Star,
  Clock,
  DollarSign,
  Phone,
  Mail,
  Building,
  Globe,
  FileText,
  ChevronRight,
} from 'lucide-react';

const APPOINTMENT_FEE = 50000;

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const steps = [
  { id: 1, label: 'Personal Info', icon: User },
  { id: 2, label: 'Purpose & Date', icon: MessageSquare },
  { id: 3, label: 'Payment', icon: CreditCard },
];

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  occupation: string;
  company: string;
  purpose: string;
  preferredDate: string;
  paymentMethod: string;
  paymentReference: string;
}

export default function AppointmentsPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState<FormData>({
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
    paymentMethod: 'crypto',
    paymentReference: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const validateStep = () => {
    if (step === 1) {
      if (!form.fullName || !form.email || !form.phone || !form.address || !form.city || !form.country || !form.occupation) {
        setError('Please fill in all required fields.');
        return false;
      }
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(form.email)) {
        setError('Please enter a valid email address.');
        return false;
      }
    }
    if (step === 2) {
      if (!form.purpose.trim() || form.purpose.trim().length < 20) {
        setError('Please describe your purpose in at least 20 characters.');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    setError('');
    setStep((s) => s + 1);
  };

  const prevStep = () => {
    setError('');
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    if (!form.paymentMethod) {
      setError('Please select a payment method.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Step 1: Create appointment
      const createRes = await fetch('/api/appointments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          country: form.country,
          occupation: form.occupation,
          company: form.company,
          purpose: form.purpose,
          preferredDate: form.preferredDate || null,
        }),
      });

      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error || 'Failed to submit appointment');

      // Step 2: Submit payment details
      const payRes = await fetch('/api/appointments/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketNumber: createData.ticketNumber,
          paymentMethod: form.paymentMethod,
          paymentReference: form.paymentReference || null,
        }),
      });

      const payData = await payRes.json();
      if (!payRes.ok) throw new Error(payData.error || 'Failed to submit payment');

      setTicketNumber(createData.ticketNumber);
      setStep(4); // Success state
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---- Success Screen ----
  if (step === 4) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg text-center"
        >
          <div className="w-20 h-20 rounded-full bg-accent/10 border-2 border-accent flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Application Submitted!</h1>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            Your appointment request has been received. Our team will review your application and
            contact you within 2–3 business days.
          </p>

          <div className="bg-secondary/50 border border-accent/30 rounded-xl p-5 mb-6 text-left">
            <p className="text-xs text-muted-foreground mb-1">Your Ticket Number</p>
            <p className="text-xl font-bold text-accent font-mono tracking-widest">{ticketNumber}</p>
            <p className="text-xs text-muted-foreground mt-2">Save this number to track your application status.</p>
          </div>

          <div className="space-y-3 text-left bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">Application submitted and under review</p>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">Payment verification in progress</p>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">Appointment date to be confirmed</p>
            </div>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 bg-accent text-background font-bold rounded-xl hover:bg-accent/90 transition-all text-sm"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center gap-3">
        <Link href="/dashboard" className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-sm font-bold text-foreground">Book Appointment</h1>
          <p className="text-xs text-muted-foreground">Private meeting with Elon Musk</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-5">

        {/* Hero Banner */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="relative overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-secondary via-secondary/80 to-background"
        >
          <div className="flex items-center gap-4 p-5">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-accent/40 flex-shrink-0">
              <Image
                src="/elon-musk.jpg"
                alt="Elon Musk"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                <span className="text-xs text-accent font-semibold uppercase tracking-widest">Exclusive Access</span>
              </div>
              <h2 className="text-lg font-bold text-foreground leading-tight">
                Private Meeting with<br />
                <span className="text-accent">Elon Musk</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Investment & business strategy sessions</p>
            </div>
          </div>

          {/* Fee badge */}
          <div className="mx-5 mb-5 grid grid-cols-3 gap-3">
            <div className="bg-background/50 rounded-lg p-3 text-center border border-white/10">
              <DollarSign className="w-4 h-4 text-accent mx-auto mb-1" />
              <p className="text-xs font-bold text-foreground">$50,000</p>
              <p className="text-xs text-muted-foreground">Session fee</p>
            </div>
            <div className="bg-background/50 rounded-lg p-3 text-center border border-white/10">
              <Clock className="w-4 h-4 text-accent mx-auto mb-1" />
              <p className="text-xs font-bold text-foreground">60 min</p>
              <p className="text-xs text-muted-foreground">Session length</p>
            </div>
            <div className="bg-background/50 rounded-lg p-3 text-center border border-white/10">
              <Lock className="w-4 h-4 text-accent mx-auto mb-1" />
              <p className="text-xs font-bold text-foreground">Private</p>
              <p className="text-xs text-muted-foreground">1-on-1 only</p>
            </div>
          </div>
        </motion.div>

        {/* Step Indicator */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 ${step >= s.id ? 'text-accent' : 'text-muted-foreground'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  step > s.id
                    ? 'bg-accent border-accent text-background'
                    : step === s.id
                    ? 'border-accent text-accent bg-accent/10'
                    : 'border-white/20 text-muted-foreground'
                }`}>
                  {step > s.id ? <CheckCircle className="w-4 h-4" /> : s.id}
                </div>
                <span className="text-xs font-medium hidden sm:block">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px mx-2 transition-all ${step > s.id ? 'bg-accent' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </motion.div>

        {/* Form Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="bg-secondary/30 border border-white/10 rounded-2xl p-5 space-y-4"
          >
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-4 h-4 text-accent" />
                  <h2 className="text-sm font-bold text-foreground">Personal Information</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        placeholder="Your full legal name"
                        className="w-full pl-9 pr-3 py-2.5 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Phone Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+1 234 567 8900"
                        className="w-full pl-9 pr-3 py-2.5 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Street Address *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="123 Main Street"
                        className="w-full pl-9 pr-3 py-2.5 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">City *</label>
                    <input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="New York"
                      className="w-full px-3 py-2.5 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Country *</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        name="country"
                        value={form.country}
                        onChange={handleChange}
                        placeholder="United States"
                        className="w-full pl-9 pr-3 py-2.5 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Occupation *</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        name="occupation"
                        value={form.occupation}
                        onChange={handleChange}
                        placeholder="CEO, Investor, etc."
                        className="w-full pl-9 pr-3 py-2.5 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Company / Organization</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        name="company"
                        value={form.company}
                        onChange={handleChange}
                        placeholder="Company name (optional)"
                        className="w-full pl-9 pr-3 py-2.5 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Purpose & Date */}
            {step === 2 && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-4 h-4 text-accent" />
                  <h2 className="text-sm font-bold text-foreground">Purpose & Preferred Date</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                      Purpose of Meeting *
                      <span className="text-accent ml-1 font-normal">(min. 20 characters)</span>
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <textarea
                        name="purpose"
                        value={form.purpose}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Describe the agenda and topics you would like to discuss. Include details about your business, investment goals, or any specific proposals..."
                        className="w-full pl-9 pr-3 py-2.5 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-colors resize-none leading-relaxed"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {form.purpose.length} characters
                      {form.purpose.length < 20 && <span className="text-destructive ml-1">(min. 20 required)</span>}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                      Preferred Date
                      <span className="text-muted-foreground ml-1 font-normal">(optional — subject to availability)</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        name="preferredDate"
                        type="date"
                        value={form.preferredDate}
                        onChange={handleChange}
                        min={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        className="w-full pl-9 pr-3 py-2.5 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Important Notice */}
                  <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                    <p className="text-xs font-semibold text-accent mb-2">Important Notes</p>
                    <ul className="space-y-1.5">
                      {[
                        'All meetings are subject to availability and approval.',
                        'The $50,000 fee is non-refundable once the appointment is confirmed.',
                        'Sessions are strictly confidential and private.',
                        'NDA may be required prior to the meeting.',
                      ].map((note, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <ChevronRight className="w-3 h-3 text-accent flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-muted-foreground">{note}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-4 h-4 text-accent" />
                  <h2 className="text-sm font-bold text-foreground">Payment Details</h2>
                </div>

                {/* Fee Summary */}
                <div className="bg-accent/5 border border-accent/30 rounded-xl p-4 flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Appointment Fee</p>
                    <p className="text-xl font-bold text-accent">${APPOINTMENT_FEE.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Session</p>
                    <p className="text-xs font-semibold text-foreground">60 min private</p>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-2">Select Payment Method *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'crypto', label: 'Crypto' },
                      { value: 'bank_transfer', label: 'Bank Transfer' },
                      { value: 'paypal', label: 'PayPal' },
                    ].map((method) => (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, paymentMethod: method.value }))}
                        className={`py-2.5 px-3 rounded-lg border-2 text-xs font-semibold transition-all ${
                          form.paymentMethod === method.value
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-white/10 bg-white/5 text-muted-foreground hover:border-white/20'
                        }`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Reference */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                    Payment Reference / Transaction ID
                    <span className="text-muted-foreground ml-1 font-normal">(optional)</span>
                  </label>
                  <input
                    name="paymentReference"
                    value={form.paymentReference}
                    onChange={handleChange}
                    placeholder="Enter transaction ID or reference after payment"
                    className="w-full px-3 py-2.5 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-colors"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    You can add this later — our team will contact you with payment instructions.
                  </p>
                </div>

                {/* Application Summary */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2.5">
                  <p className="text-xs font-bold text-foreground mb-3">Application Summary</p>
                  {[
                    { icon: User, label: 'Name', value: form.fullName },
                    { icon: Mail, label: 'Email', value: form.email },
                    { icon: Briefcase, label: 'Occupation', value: form.company ? `${form.occupation} at ${form.company}` : form.occupation },
                    { icon: Globe, label: 'Location', value: `${form.city}, ${form.country}` },
                    { icon: Calendar, label: 'Preferred Date', value: form.preferredDate ? new Date(form.preferredDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Flexible' },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-2">
                      <Icon className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                      <div className="flex gap-1.5 flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground flex-shrink-0">{label}:</p>
                        <p className="text-xs text-foreground truncate">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-start gap-2 bg-yellow-400/5 border border-yellow-400/20 rounded-xl p-3">
                  <Lock className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    Your application is encrypted and reviewed privately by our team. Payment instructions will be provided after initial approval.
                  </p>
                </div>
              </>
            )}

            {/* Error message */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-xs text-destructive">{error}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-muted-foreground text-xs font-semibold hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-accent text-background rounded-lg text-xs font-bold hover:bg-accent/90 transition-all"
                >
                  Continue
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-accent text-background rounded-lg text-xs font-bold hover:bg-accent/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      Submit Application
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
