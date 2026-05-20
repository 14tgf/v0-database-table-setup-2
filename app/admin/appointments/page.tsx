'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, ChevronDown, Calendar, DollarSign, User, Mail, Phone, MapPin, Briefcase } from 'lucide-react';

interface Appointment {
  id: string;
  ticket_number: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  occupation: string;
  company: string;
  purpose: string;
  preferred_date: string;
  status: string;
  payment_status: string;
  payment_method: string;
  payment_reference: string;
  amount: number;
  created_at: string;
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/appointments');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch appointments');
      }
      
      setAppointments(data.appointments || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setMessage({ type: 'error', text: `Failed to load appointments: ${errorMessage}` });
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (appointmentId: string) => {
    setActionLoading(appointmentId);
    try {
      const response = await fetch('/api/admin/appointments/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment_id: appointmentId, action: 'approve' }),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to approve appointment' });
        return;
      }

      setMessage({ type: 'success', text: 'Appointment approved successfully' });
      setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status: 'approved' } : a));
      setExpandedId(null);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to approve appointment' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (appointmentId: string) => {
    setActionLoading(appointmentId);
    try {
      const response = await fetch('/api/admin/appointments/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment_id: appointmentId, action: 'reject' }),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to reject appointment' });
        return;
      }

      setMessage({ type: 'success', text: 'Appointment rejected' });
      setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status: 'rejected' } : a));
      setExpandedId(null);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to reject appointment' });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-400/10 border-green-400/30';
      case 'rejected': return 'bg-red-400/10 border-red-400/30';
      default: return 'bg-yellow-400/10 border-yellow-400/30';
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    const colors = {
      paid: 'bg-green-400/20 text-green-400 border-green-400/30',
      pending: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30',
      unpaid: 'bg-red-400/20 text-red-400 border-red-400/30',
    };
    return colors[status as keyof typeof colors] || colors.unpaid;
  };

  const filteredAppointments = appointments.filter(a => filter === 'all' || a.status === filter);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4 max-w-6xl"
    >
      <motion.div variants={staggerItem} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Elon Musk Appointments</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage appointment requests ($50,000 fee)</p>
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors capitalize ${
                filter === f
                  ? 'bg-accent/20 text-accent border-accent/50'
                  : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </motion.div>

      {message && (
        <motion.div
          variants={staggerItem}
          className={`p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-400/10 border-green-400/30 text-green-300'
              : 'bg-red-400/10 border-red-400/30 text-red-300'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-white/60">Loading appointments...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <motion.div
          variants={staggerItem}
          className="p-6 bg-white/5 border border-white/10 rounded-lg text-center"
        >
          <p className="text-white/60">No appointment requests found</p>
        </motion.div>
      ) : (
        <motion.div variants={staggerItem} className="space-y-3">
          {filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className={`border rounded-lg overflow-hidden transition-all ${getStatusColor(appointment.status)}`}
            >
              <button
                onClick={() => setExpandedId(expandedId === appointment.id ? null : appointment.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4 text-left flex-1">
                  {getStatusIcon(appointment.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{appointment.full_name}</p>
                      <span className="text-xs text-accent font-mono">#{appointment.ticket_number}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{appointment.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-accent">${appointment.amount.toLocaleString()}</p>
                    <span className={`inline-block px-2 py-0.5 text-xs rounded border ${getPaymentStatusBadge(appointment.payment_status)}`}>
                      {appointment.payment_status}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground text-right ml-4 hidden md:block">
                    <p className="capitalize font-medium">{appointment.status}</p>
                    <p>{new Date(appointment.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 ml-3 transition-transform ${expandedId === appointment.id ? 'rotate-180' : ''}`} />
              </button>

              {expandedId === appointment.id && (
                <div className="p-4 border-t border-white/10 bg-white/[0.02] space-y-4">
                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-2">
                      <Mail className="w-4 h-4 text-accent mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm text-foreground">{appointment.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-accent mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="text-sm text-foreground">{appointment.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-accent mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="text-sm text-foreground">{appointment.city}, {appointment.country}</p>
                      </div>
                    </div>
                  </div>

                  {/* Professional Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <Briefcase className="w-4 h-4 text-accent mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Occupation / Company</p>
                        <p className="text-sm text-foreground">{appointment.occupation} {appointment.company && `at ${appointment.company}`}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-accent mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Preferred Date</p>
                        <p className="text-sm text-foreground">{appointment.preferred_date ? new Date(appointment.preferred_date).toLocaleDateString() : 'Flexible'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Purpose */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Purpose of Meeting</p>
                    <p className="text-sm text-foreground bg-white/5 p-3 rounded-lg">{appointment.purpose}</p>
                  </div>

                  {/* Payment Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-white/10">
                    <div className="flex items-start gap-2">
                      <DollarSign className="w-4 h-4 text-accent mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Payment Method</p>
                        <p className="text-sm text-foreground">{appointment.payment_method || 'Not selected'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Payment Reference</p>
                      <p className="text-sm text-foreground font-mono">{appointment.payment_reference || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="text-sm text-foreground">{appointment.address}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {appointment.status === 'pending' && (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleApprove(appointment.id)}
                        disabled={actionLoading === appointment.id}
                        className="flex-1 px-3 py-2 bg-green-400/20 text-green-400 border border-green-400/50 rounded hover:bg-green-400/30 disabled:opacity-50 transition-colors text-sm font-medium"
                      >
                        {actionLoading === appointment.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(appointment.id)}
                        disabled={actionLoading === appointment.id}
                        className="flex-1 px-3 py-2 bg-red-400/20 text-red-400 border border-red-400/50 rounded hover:bg-red-400/30 disabled:opacity-50 transition-colors text-sm font-medium"
                      >
                        {actionLoading === appointment.id ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
