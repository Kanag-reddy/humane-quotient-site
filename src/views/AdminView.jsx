import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { values, levels } from '../data/huqData';
import { ShieldIcon, SearchIcon, DownloadIcon, ValueIcon, UserIcon } from '../components/Icons';

export function AdminView() {
  const { token, isAdmin, openAuthModal } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // User search state
  const [searchEmail, setSearchEmail] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [expandedSubId, setExpandedSubId] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;

    async function fetchOverview() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/admin/overview', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.ok) {
          setStats(data.stats);
        } else {
          setError(data.error || 'Failed to load admin statistics.');
        }
      } catch (err) {
        setError('Network error fetching statistics.');
      } finally {
        setLoading(false);
      }
    }
    fetchOverview();
  }, [isAdmin, token]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;

    setSearchLoading(true);
    setSearchError('');
    setSearchResult(null);

    try {
      const res = await fetch(`/api/admin/user-data?email=${encodeURIComponent(searchEmail.trim())}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!data.ok) {
        setSearchError(data.error || 'Could not find user data.');
      } else {
        setSearchResult(data.data);
      }
    } catch (err) {
      setSearchError('Network error searching user data.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const res = await fetch('/api/admin/download-excel', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'HuQ_Responses.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Failed to download Excel file.');
    }
  };

  if (!isAdmin) {
    return (
      <div className="state-page">
        <div className="wrap">
          <div className="state state-error">
            <div className="state-logo">
              <ShieldIcon size={48} />
            </div>
            <span className="eyebrow">Restricted Access</span>
            <h1>Administrator Authentication Required</h1>
            <p className="lead">
              You must sign in with an administrator account to view the dashboard and query user submissions.
            </p>
            <div className="state-actions">
              <button className="btn primary" onClick={() => openAuthModal('admin')}>
                Sign In as Administrator
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="wrap">
        <div className="admin-header">
          <div>
            <span className="eyebrow pill-eb">
              <ShieldIcon size={13} /> Administrator Console
            </span>
            <h1>Humane Quotient Overview</h1>
            <p className="lead" style={{ margin: 0 }}>
              Live aggregate metrics, care-level distributions, and user data query.
            </p>
          </div>

          <button className="btn primary" onClick={handleDownloadExcel}>
            <DownloadIcon size={16} /> Export All Data (.xlsx)
          </button>
        </div>

        {error && <div className="modal-err" style={{ marginBottom: '24px' }}>{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p>Loading analytics…</p>
          </div>
        ) : stats ? (
          <>
            {/* KPI Cards */}
            <div className="admin-stats-grid">
              <div className="admin-card">
                <span className="admin-stat-label">Total Submissions</span>
                <span className="admin-stat-value">{stats.totalSubmissions}</span>
                <span className="admin-stat-sub">
                  {stats.registeredSubmissions} by users · {stats.guestSubmissions} guests
                </span>
              </div>

              <div className="admin-card">
                <span className="admin-stat-label">Registered Accounts</span>
                <span className="admin-stat-value">{stats.totalUsers}</span>
                <span className="admin-stat-sub">Authenticated participants</span>
              </div>

              <div className="admin-card">
                <span className="admin-stat-label">Average HuQ</span>
                <span className="admin-stat-value">{stats.avgHuq} <small style={{ fontSize: '1rem' }}>/ 10</small></span>
                <span className="admin-stat-sub">Across all completed tests</span>
              </div>

              <div className="admin-card">
                <span className="admin-stat-label">Care Level Split</span>
                <div className="admin-split-bar">
                  <span style={{ color: levels[0].color }}>Self: {stats.careLevels.selfCare}</span>
                  <span style={{ color: levels[1].color }}>Socio: {stats.careLevels.socioCare}</span>
                  <span style={{ color: levels[2].color }}>Univ: {stats.careLevels.universalCare}</span>
                </div>
                <span className="admin-stat-sub">Stream → River → Ocean</span>
              </div>
            </div>

            {/* Quotient Averages Bar Breakdown */}
            <div className="big-card" style={{ marginTop: '28px' }}>
              <h2>Quotient Averages Across All Respondents</h2>
              <div className="admin-quotient-grid">
                {stats.quotientAverages.map((q) => (
                  <div key={q.key} className="admin-quotient-bar-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <b>{q.name} ({q.code})</b>
                      <span>{q.averageQuotient} / 10 ({q.averageScore}/60)</span>
                    </div>
                    <div className="bar" style={{ height: '8px', background: 'var(--sand)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${(q.averageScore / 60) * 100}%`,
                          background: 'var(--crimson)',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User Submission Email Query Tool */}
            <div className="big-card" style={{ marginTop: '36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <SearchIcon size={24} />
                <h2 style={{ margin: 0 }}>Query User Submissions by Email</h2>
              </div>
              <p style={{ color: '#6b3a33', margin: '8px 0 20px' }}>
                Search for any user to inspect all their test attempts, recorded scores, quotient levels, and demographic details.
              </p>

              <form onSubmit={handleSearch} className="admin-search-form">
                <input
                  type="email"
                  required
                  placeholder="Enter email address (e.g. user@example.com)..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="admin-search-input"
                />
                <button className="btn primary" type="submit" disabled={searchLoading}>
                  {searchLoading ? 'Searching…' : 'Find Submissions'}
                </button>
              </form>

              {searchError && (
                <div className="modal-err" style={{ marginTop: '16px' }}>
                  {searchError}
                </div>
              )}

              {searchResult && (
                <div className="admin-search-results" style={{ marginTop: '24px' }}>
                  <div className="admin-user-summary-card">
                    <div>
                      <span className="eyebrow" style={{ marginBottom: '4px' }}>Participant Profile</span>
                      <h3 style={{ margin: 0 }}>{searchResult.email}</h3>
                      <p style={{ margin: '4px 0 0', fontSize: '0.92rem' }}>
                        Status: <b>{searchResult.isRegistered ? 'Registered User' : 'Guest Submitter'}</b>
                        {searchResult.user && ` · Name: ${searchResult.user.name} · Joined: ${new Date(searchResult.user.createdAt).toLocaleDateString()}`}
                      </p>
                    </div>
                    <span className="chip" style={{ background: 'var(--crimson)', color: 'var(--cream)' }}>
                      {searchResult.submissions.length} Total Test{searchResult.submissions.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {searchResult.submissions.length === 0 ? (
                    <p style={{ marginTop: '16px', color: 'var(--bronze)' }}>
                      No test submissions found for this email address.
                    </p>
                  ) : (
                    <div className="admin-submissions-list" style={{ marginTop: '18px' }}>
                      {searchResult.submissions.map((sub, idx) => {
                        const isExpanded = expandedSubId === sub.submissionId;
                        const sc = sub.scores || {};
                        const dateStr = new Date(sub.createdAt).toLocaleString();

                        return (
                          <div key={sub.submissionId || idx} className="admin-sub-item">
                            <div className="admin-sub-header">
                              <div>
                                <b>{sub.name}</b> <span style={{ color: 'var(--bronze)', fontSize: '0.85rem' }}>({dateStr})</span>
                                <div style={{ fontSize: '0.9rem', marginTop: '2px' }}>
                                  ID: <code>{sub.submissionId}</code> · HuQ: <b>{(Math.round((sc.huq || 0) * 10) / 10).toFixed(1)}/10</b> ({sc.total}/480) · Care Level: <b>{levels[sc.level]?.name || 'N/A'}</b>
                                </div>
                              </div>
                              <button
                                className="btn ghost"
                                type="button"
                                style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                                onClick={() => setExpandedSubId(isExpanded ? null : sub.submissionId)}
                              >
                                {isExpanded ? 'Hide Details' : 'View Full Breakdown'}
                              </button>
                            </div>

                            {isExpanded && (
                              <div className="admin-sub-detail-body">
                                <h4>Demographics</h4>
                                <div className="admin-demo-grid">
                                  <div><b>Age:</b> {sub.demographics?.age || 'N/A'}</div>
                                  <div><b>Gender:</b> {sub.demographics?.gender || 'N/A'}</div>
                                  <div><b>Role:</b> {sub.demographics?.role || 'N/A'}</div>
                                  <div><b>Organization:</b> {sub.demographics?.organization || 'N/A'}</div>
                                  <div><b>Qualification:</b> {sub.demographics?.qualification || 'N/A'}</div>
                                  {sub.demographics?.course && <div><b>Course:</b> {sub.demographics.course}</div>}
                                  {sub.demographics?.stage && <div><b>Stage:</b> {sub.demographics.stage}</div>}
                                </div>

                                <h4 style={{ marginTop: '16px' }}>Quotients Breakdown</h4>
                                <div className="admin-values-pillrow">
                                  {sc.values?.map((v) => (
                                    <div key={v.key} className="admin-val-pill">
                                      <span>{v.name}:</span>
                                      <b>{(Math.round(v.quotient * 10) / 10).toFixed(1)}/10</b>
                                      <small>({v.score}/60)</small>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recent Submissions Table */}
            <div className="big-card" style={{ marginTop: '36px' }}>
              <h2>Recent Submissions</h2>
              <table className="sumtable">
                <thead>
                  <tr>
                    <th>Respondent</th>
                    <th>Email</th>
                    <th>HuQ Score</th>
                    <th>Care Level</th>
                    <th>Type</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentSubmissions.map((s) => (
                    <tr key={s.id}>
                      <td><b>{s.name}</b></td>
                      <td>{s.email}</td>
                      <td><b>{s.huq}/10</b></td>
                      <td>{s.careLevel}</td>
                      <td>
                        <span className={`chip ${s.isGuest ? 'guest' : 'user'}`}>
                          {s.isGuest ? 'Guest' : 'User'}
                        </span>
                      </td>
                      <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
