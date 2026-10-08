import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTest } from '../context/TestContext';
import { levels } from '../data/huqData';

export function UserHistoryView({ onSelectSubmission, onRetake }) {
  const { user, token } = useAuth();
  const { loadSavedResult } = useTest();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchHistory() {
      if (!token) return;
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/my-submissions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.ok) {
          setHistory(data.submissions || []);
        } else {
          setError(data.error || 'Failed to fetch your test history.');
        }
      } catch (err) {
        setError('Network error fetching test history.');
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [token]);

  const handleViewProfile = (sub) => {
    loadSavedResult(sub.scores, sub.answers, sub.demographics);
    onSelectSubmission();
  };

  return (
    <div className="history-page">
      <div className="wrap">
        <div style={{ marginBottom: '32px' }}>
          <span className="eyebrow">Personal Dashboard</span>
          <h1>Your Humane Quotient Journey</h1>
          <p className="lead" style={{ margin: 0 }}>
            Welcome back, <b>{user?.name}</b>. Track how your care and quotients have evolved over time.
          </p>
        </div>

        {error && <div className="modal-err" style={{ marginBottom: '24px' }}>{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p>Loading your test history…</p>
          </div>
        ) : history.length === 0 ? (
          <div className="big-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <h2>No test submissions yet</h2>
            <p style={{ maxWidth: '48ch', margin: '12px auto 24px' }}>
              You haven't completed any Humane Quotient tests while signed into this account.
            </p>
            <button className="btn primary" onClick={onRetake}>
              Take Your First Test →
            </button>
          </div>
        ) : (
          <div className="history-list">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontWeight: 600 }}>{history.length} Completed Assessment{history.length !== 1 ? 's' : ''}</span>
              <button className="btn gold" style={{ padding: '8px 20px', fontSize: '0.9rem' }} onClick={onRetake}>
                Take Another Assessment
              </button>
            </div>

            <div className="history-grid">
              {history.map((sub, idx) => {
                const sc = sub.scores || {};
                const l = levels[sc.level] || levels[0];
                const dateStr = new Date(sub.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });

                return (
                  <div key={sub.submissionId || idx} className="card history-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className="history-date">{dateStr}</span>
                      <span className="chip" style={{ background: l.color, color: l.ink }}>
                        {l.name}
                      </span>
                    </div>

                    <div className="history-score-row">
                      <div className="history-score-num">
                        <b>{(Math.round((sc.huq || 0) * 10) / 10).toFixed(1)}</b>
                        <span>/ 10</span>
                      </div>
                      <div className="history-sub-stats">
                        <div>Total: <b>{sc.total} / 480</b></div>
                        <div>ID: <code>{sub.submissionId}</code></div>
                      </div>
                    </div>

                    <div className="history-values-preview">
                      {(sc.values || []).map((v) => (
                        <span key={v.key} title={`${v.name}: ${(Math.round(v.quotient * 10) / 10).toFixed(1)}/10`}>
                          {v.code}: <b>{(Math.round(v.quotient * 10) / 10).toFixed(1)}</b>
                        </span>
                      ))}
                    </div>

                    <button
                      className="btn primary"
                      style={{ width: '100%', marginTop: '16px' }}
                      onClick={() => handleViewProfile(sub)}
                    >
                      View Profile & Action Plan →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
