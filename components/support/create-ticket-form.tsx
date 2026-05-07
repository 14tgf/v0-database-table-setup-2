'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, XIcon, CheckCircle } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from '@/lib/support';

interface CreateTicketFormProps {
  onTicketCreated?: () => void;
}

export function CreateTicketForm({ onTicketCreated }: CreateTicketFormProps) {
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    priority: 'Medium',
    message: '',
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setError(null);

    if (!formData.subject.trim()) {
      setError('Subject is required');
      return;
    }
    if (!formData.category) {
      setError('Category is required');
      return;
    }
    if (!formData.message.trim()) {
      setError('Message is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('User ID not found. Please log in again.');
        return;
      }

      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          subject: formData.subject,
          category: formData.category,
          priority: formData.priority,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create ticket');
        return;
      }

      console.log('[v0] Ticket created successfully:', data.ticket.id);
      
      // Reset form
      setFormData({
        subject: '',
        category: '',
        priority: 'Medium',
        message: '',
      });
      setUploadedFile(null);
      
      // Notify parent to refresh tickets
      onTicketCreated?.();
      
      alert('Support ticket created successfully! We will get back to you soon.');
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'An error occurred';
      console.error('[v0] Error creating ticket:', err);
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-white/10 rounded-lg p-4 backdrop-blur-sm"
    >
      <motion.h2 variants={staggerItem} className="text-base font-bold text-foreground mb-3">
        Create Support Ticket
      </motion.h2>

      {error && (
        <motion.div variants={staggerItem} className="mb-3 p-2.5 bg-red-400/10 border border-red-400/30 rounded-lg">
          <p className="text-xs text-red-400">{error}</p>
        </motion.div>
      )}

      <motion.div variants={staggerContainer} className="space-y-3">
        {/* Subject */}
        <motion.div variants={staggerItem}>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">
            Subject
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            placeholder="Brief description of your issue"
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 text-xs"
          />
        </motion.div>

        {/* Category and Priority */}
        <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Category
            </label>
            <select 
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:border-accent/50 text-xs"
            >
              <option value="">Select category</option>
              {TICKET_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Priority
            </label>
            <select 
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:border-accent/50 text-xs"
            >
              {TICKET_PRIORITIES.map(pri => (
                <option key={pri} value={pri}>{pri}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Message */}
        <motion.div variants={staggerItem}>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">
            Message
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            placeholder="Describe your issue in detail"
            rows={3}
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 text-xs resize-none"
          />
        </motion.div>

        {/* File Upload */}
        <motion.div variants={staggerItem}>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
            Attachment (Optional)
          </label>
          {!uploadedFile ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-3 text-center transition-all ${
                dragActive ? 'border-accent bg-accent/5' : 'border-white/20 hover:border-accent/50'
              }`}
            >
              <Upload className="w-5 h-5 text-accent mx-auto mb-1" />
              <p className="text-xs font-semibold text-foreground mb-0.5">Drop files or click to upload</p>
              <p className="text-xs text-muted-foreground mb-1.5">Max 10MB - PDF, JPG, PNG</p>
              <label className="inline-block">
                <input
                  type="file"
                  onChange={handleChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                />
                <span className="px-2.5 py-1.5 bg-accent text-background font-semibold rounded hover:bg-accent/90 transition-colors cursor-pointer text-xs inline-block">
                  Choose File
                </span>
              </label>
            </div>
          ) : (
            <div className="p-2.5 bg-accent/10 border border-accent/30 rounded-lg flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-foreground">{uploadedFile.name}</p>
                <p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                onClick={() => setUploadedFile(null)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <XIcon className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          )}
        </motion.div>

        {/* Submit Button */}
        <motion.div variants={staggerItem}>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full px-4 py-2 font-semibold rounded text-xs transition-all ${
              isSubmitting
                ? 'bg-white/10 text-muted-foreground cursor-not-allowed'
                : 'bg-accent text-background hover:bg-accent/90'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
