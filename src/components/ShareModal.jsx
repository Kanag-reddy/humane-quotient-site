import React, { useState } from 'react';
import { MailIcon } from './Icons';

export function ShareModal({ isOpen, onClose, result, userName }) {
  const [targetEmail, setTargetEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ message: '', error: false });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ message: '', error: false });
    setSubmitting(true);

    try {
      const res = await fetch('/api/share-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEmail: targetEmail.trim(),
          name: userName || 'Friend',
          results: result
        })
      });
      const data = await res.json();

      if (!data.ok) {
        setStatus({ message: data.error || 'Failed to send report.', error: true });
      } else {
        setStatus({ message: `Report successfully dispatched to ${targetEmail}!`, error: false });
        setTimeout(() => {
          onClose();
          setStatus({ message: '', error: false });
          setTargetEmail('');
        }, 2200);
      }
    } catch (err) {
      setStatus({ message: 'Network error sending report.', error: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          ×
        </button>

        <div className="modal-head">
          <div className="modal-icon-badge">
            <MailIcon size={24} />
          </div>
          <h2>Share Your HuQ Report</h2>
          <p className="modal-sub">
            Send a formatted copy of your Humane Quotient assessment to yourself, a mentor, or a friend.
          </p>
        </div>

        {status.message && (
          <div className={`modal-msg ${status.error ? 'err' : 'ok'}`} role="status">
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="field">
            <label htmlFor="share-email">Recipient Email Address</label>
            <input
              id="share-email"
              type="email"
              required
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              placeholder="recipient@example.com"
              autoFocus
            />
          </div>

          <p className="fine" style={{ margin: '8px 0 16px' }}>
            The recipient will receive an email containing your overall HuQ, strongest quotient, quotient breakdown, and reflection notes.
          </p>

          <button className="btn primary" type="submit" disabled={submitting} style={{ width: '100%' }}>
            {submitting ? 'Sending Report…' : 'Send Report via Email'}
          </button>
        </form>
      </div>
    </div>
  );
}
