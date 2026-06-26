import React, { useState } from 'react';
import { X, Loader, Truck } from 'lucide-react';
import { authenticatedFetch } from '../lib/api';

interface CreateDeliveryPersonnelModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateDeliveryPersonnelModal: React.FC<CreateDeliveryPersonnelModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.first_name.trim()) {
      setError('First name is required');
      return;
    }
    if (!formData.last_name.trim()) {
      setError('Last name is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone is required');
      return;
    }
    if (!formData.password) {
      setError('Password is required');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const response = await authenticatedFetch('/users/admin/delivery-personnel/register/', {
        method: 'POST',
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          confirm_password: formData.confirm_password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.errors
            ? Object.values(data.errors).flat().join(', ')
            : data.detail || 'Failed to create delivery personnel'
        );
      }

      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create delivery personnel';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-panel2 border border-line rounded-[7px] px-3 py-2 text-[12.5px] text-body outline-none focus:border-accent/50 placeholder:text-mute disabled:opacity-50';
  const labelClass =
    'block font-mono text-[10.5px] tracking-[.12em] uppercase text-mute mb-1.5';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[7vh] pb-[4vh] bg-black/60 animate-fade"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[90%] flex flex-col bg-panel border border-line rounded-card shadow-[0_30px_80px_-20px_rgba(0,0,0,.87)] overflow-hidden animate-pop"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line">
          <div className="w-9 h-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0">
            <Truck size={17} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-mono font-semibold text-sm tracking-[.08em] uppercase text-body">New Personnel</span>
            <div className="text-mute text-xs mt-0.5">Add a delivery courier</div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[7px] flex items-center justify-center bg-panel border border-line text-dim hover:text-body hover:border-line2 transition"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-4 overflow-y-auto flex-1 space-y-3.5">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-neg/10 border border-neg/30 rounded-[7px]">
                <p className="text-xs text-neg">{error}</p>
              </div>
            )}

            {/* First Name */}
            <div>
              <label htmlFor="first_name" className={labelClass}>
                First Name *
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                placeholder="John"
                className={inputClass}
                disabled={loading}
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="last_name" className={labelClass}>
                Last Name *
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                placeholder="Doe"
                className={inputClass}
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className={labelClass}>
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                className={inputClass}
                disabled={loading}
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className={labelClass}>
                Phone *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+27123456789"
                className={inputClass}
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className={labelClass}>
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Minimum 8 characters"
                className={inputClass}
                disabled={loading}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm_password" className={labelClass}>
                Confirm Password *
              </label>
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleInputChange}
                placeholder="Re-enter password"
                className={inputClass}
                disabled={loading}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="px-4 py-3 border-t border-line flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="inline-flex items-center justify-center px-3.5 py-2 text-[12.5px] font-bold rounded-[7px] bg-panel text-dim border border-line hover:border-line2 hover:text-body transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-[7px] px-3.5 py-2 text-[12.5px] font-bold rounded-[7px] bg-accent text-accent-ink border border-accent hover:brightness-110 transition whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader size={14} className="animate-spin" />}
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDeliveryPersonnelModal;
