import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { values, levels } from '../data/huqData';
import { ShieldIcon, SearchIcon, DownloadIcon, ValueIcon, UserIcon } from '../components/Icons';

const ALL_SUBMISSION_COLUMNS = [
  { key: 'name', label: 'Respondent' },
  { key: 'email', label: 'Email' },
  { key: 'organization', label: 'Organization' },
  { key: 'huq', label: 'HuQ Score' },
  { key: 'careLevel', label: 'Care Level' },
  { key: 'version', label: 'Test Type' },
  { key: 'createdAt', label: 'Submitted' }
];

export function AdminView() {
  const { token, isAdmin, openAuthModal } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // User search state
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    email: '',
    organization: '',
    role: '',
    age: '',
    gender: '',
    qualification: '',
    course: '',
    submissionId: '',
    version: '',
    careLevel: '',
    minHuq: '',
    maxHuq: ''
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [expandedSubId, setExpandedSubId] = useState(null);
  const [activeSubmissionTab, setActiveSubmissionTab] = useState('full');
  const [submissionListTab, setSubmissionListTab] = useState('recent');
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [allSubmissionsPage, setAllSubmissionsPage] = useState(1);
  const [allSubmissionsPagination, setAllSubmissionsPagination] = useState(null);
  const [allSubmissionsLoading, setAllSubmissionsLoading] = useState(false);
  const [allSubmissionsError, setAllSubmissionsError] = useState('');
  const [allSubmissionsSort, setAllSubmissionsSort] = useState({ key: 'createdAt', direction: 'desc' });

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

  useEffect(() => {
    if (!isAdmin || submissionListTab !== 'all') return undefined;

    const controller = new AbortController();
    async function fetchAllSubmissions() {
      setAllSubmissionsLoading(true);
      setAllSubmissionsError('');
      setAllSubmissions([]);
      setAllSubmissionsPagination(null);
      const params = new URLSearchParams({
        page: String(allSubmissionsPage),
        limit: '50',
        sortBy: allSubmissionsSort.key,
        sortOrder: allSubmissionsSort.direction
      });

      try {
        const res = await fetch(`/api/admin/submissions?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setAllSubmissionsError(data.error || 'Failed to load all submissions.');
          return;
        }
        setAllSubmissions(data.data.submissions);
        setAllSubmissionsPagination(data.data.pagination);
      } catch (err) {
        if (err.name !== 'AbortError') setAllSubmissionsError('Network error loading submissions.');
      } finally {
        if (!controller.signal.aborted) setAllSubmissionsLoading(false);
      }
    }

    fetchAllSubmissions();
    return () => controller.abort();
  }, [allSubmissionsPage, allSubmissionsSort, isAdmin, submissionListTab, token]);

  const handleSearch = async (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(searchFilters).forEach(([key, value]) => {
      if (value.trim()) params.set(key, value.trim());
    });
    if (Object.values(searchFilters).every((value) => !value.trim())) {
      setSearchError('Enter at least one search filter.');
      setSearchResult(null);
      return;
    }

    setSearchLoading(true);
    setSearchError('');
    setSearchResult(null);
    setExpandedSubId(null);

    try {
      const res = await fetch(`/api/admin/user-data?${params.toString()}`, {
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

  const handleSearchFilterChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters((current) => ({ ...current, [name]: value }));
  };

  const clearSearch = () => {
    setSearchFilters((current) => Object.fromEntries(
      Object.keys(current).map((key) => [key, ''])
    ));
    setSearchResult(null);
    setSearchError('');
  };

  const handleSubmissionSort = (key) => {
    setAllSubmissionsSort((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
    setAllSubmissionsPage(1);
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
              <button className="btn primary" onClick={() => openAuthModal('login')}>
                Sign In
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

            {/* User Submission Search Tool */}
            <div className="big-card" style={{ marginTop: '36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <SearchIcon size={24} />
                <h2 style={{ margin: 0 }}>Search User Submissions</h2>
              </div>
              <p style={{ color: '#6b3a33', margin: '8px 0 20px' }}>
                Use one or more details to find matching test attempts. Text fields match partial values.
              </p>

              <form onSubmit={handleSearch}>
                <div className="admin-search-grid">
                  <label>
                    <span>Name</span>
                    <input name="name" value={searchFilters.name} onChange={handleSearchFilterChange} placeholder="Participant name" />
                  </label>
                  <label>
                    <span>Email</span>
                    <input name="email" value={searchFilters.email} onChange={handleSearchFilterChange} placeholder="Email address" />
                  </label>
                  <label>
                    <span>Organization</span>
                    <input name="organization" value={searchFilters.organization} onChange={handleSearchFilterChange} placeholder="Organization or institution" />
                  </label>
                  <label>
                    <span>Role</span>
                    <input name="role" value={searchFilters.role} onChange={handleSearchFilterChange} placeholder="Participant role" />
                  </label>
                  <label>
                    <span>Age group</span>
                    <input name="age" value={searchFilters.age} onChange={handleSearchFilterChange} placeholder="e.g. 18–24" />
                  </label>
                  <label>
                    <span>Gender</span>
                    <input name="gender" value={searchFilters.gender} onChange={handleSearchFilterChange} placeholder="Gender" />
                  </label>
                  <label>
                    <span>Qualification</span>
                    <input name="qualification" value={searchFilters.qualification} onChange={handleSearchFilterChange} placeholder="Qualification" />
                  </label>
                  <label>
                    <span>Course</span>
                    <input name="course" value={searchFilters.course} onChange={handleSearchFilterChange} placeholder="Course or program" />
                  </label>
                  <label>
                    <span>Submission ID</span>
                    <input name="submissionId" value={searchFilters.submissionId} onChange={handleSearchFilterChange} placeholder="Submission ID" />
                  </label>
                  <label>
                    <span>Test type</span>
                    <select name="version" value={searchFilters.version} onChange={handleSearchFilterChange}>
                      <option value="">All test types</option>
                      <option value="full">Full test</option>
                      <option value="quick">Quick test</option>
                    </select>
                  </label>
                  <label>
                    <span>Care level</span>
                    <select name="careLevel" value={searchFilters.careLevel} onChange={handleSearchFilterChange}>
                      <option value="">All care levels</option>
                      <option value="0">Self-Care</option>
                      <option value="1">Socio-Care</option>
                      <option value="2">Universal Care</option>
                    </select>
                  </label>
                  <label>
                    <span>HuQ minimum</span>
                    <input type="number" name="minHuq" min="0" max="10" step="0.1" value={searchFilters.minHuq} onChange={handleSearchFilterChange} placeholder="0" />
                  </label>
                  <label>
                    <span>HuQ maximum</span>
                    <input type="number" name="maxHuq" min="0" max="10" step="0.1" value={searchFilters.maxHuq} onChange={handleSearchFilterChange} placeholder="10" />
                  </label>
                </div>
                <div className="admin-search-actions">
                  <button className="btn primary" type="submit" disabled={searchLoading}>
                    {searchLoading ? 'Searching…' : 'Find Submissions'}
                  </button>
                  <button className="btn ghost" type="button" onClick={clearSearch} disabled={searchLoading}>
                    Clear
                  </button>
                </div>
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
                      <span className="eyebrow" style={{ marginBottom: '4px' }}>
                        {searchResult.email ? 'Participant Profile' : 'Matching Submissions'}
                      </span>
                      {searchResult.email ? (
                        <>
                          <h3 style={{ margin: 0 }}>{searchResult.email}</h3>
                          <p style={{ margin: '4px 0 0', fontSize: '0.92rem' }}>
                            Status: <b>{searchResult.isRegistered ? 'Registered User' : 'Guest Submitter'}</b>
                            {searchResult.user && ` · Name: ${searchResult.user.name} · Joined: ${new Date(searchResult.user.createdAt).toLocaleDateString()}`}
                          </p>
                        </>
                      ) : (
                        <h3 style={{ margin: 0 }}>
                          {new Set(searchResult.submissions.map((submission) => submission.email)).size} matching profile(s)
                        </h3>
                      )}
                    </div>
                    <span className="chip" style={{ background: 'var(--crimson)', color: 'var(--cream)' }}>
                      {searchResult.totalMatches} matching test{searchResult.totalMatches !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {searchResult.submissions.length === 0 ? (
                    <p style={{ marginTop: '16px', color: 'var(--bronze)' }}>
                      No test submissions match these search filters.
                    </p>
                  ) : (
                    <div className="admin-submissions-list" style={{ marginTop: '18px' }}>
                      {searchResult.truncated && (
                        <p role="status">Showing the newest {searchResult.submissions.length} of {searchResult.totalMatches} matches. Add filters to narrow your search.</p>
                      )}
                      {(() => {
                        const fullSubmissions = searchResult.submissions.filter((sub) => (sub.version || 'full') === 'full');
                        const quickSubmissions = searchResult.submissions.filter((sub) => sub.version === 'quick');
                        const visibleSubmissions = activeSubmissionTab === 'full' ? fullSubmissions : quickSubmissions;
                        return (
                          <>
                            <div className="history-tabs admin-history-tabs" role="tablist" aria-label="Submission test versions">
                              <button type="button" role="tab" aria-selected={activeSubmissionTab === 'full'} className={activeSubmissionTab === 'full' ? 'active' : ''} onClick={() => setActiveSubmissionTab('full')}>
                                Full Test <span>{fullSubmissions.length}</span>
                              </button>
                              <button type="button" role="tab" aria-selected={activeSubmissionTab === 'quick'} className={activeSubmissionTab === 'quick' ? 'active' : ''} onClick={() => setActiveSubmissionTab('quick')}>
                                Quick Test <span>{quickSubmissions.length}</span>
                              </button>
                            </div>
                            {visibleSubmissions.length === 0 ? (
                              <div className="big-card" style={{ textAlign: 'center', padding: '28px 18px' }}>
                                <h3>No {activeSubmissionTab === 'full' ? 'Full' : 'Quick'} Test submissions</h3>
                              </div>
                            ) : visibleSubmissions.map((sub, idx) => {
                        const isExpanded = expandedSubId === sub.submissionId;
                        const sc = sub.scores || {};
                        const dateStr = new Date(sub.createdAt).toLocaleString();

                        return (
                          <div key={sub.submissionId || idx} className="admin-sub-item">
                            <div className="admin-sub-header">
                              <div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                  <b>{sub.name}</b>
                                  <span className="history-version-chip">{(sub.version || 'full') === 'quick' ? 'Quick / Beta' : 'Full'}</span>
                                  <span style={{ color: 'var(--bronze)', fontSize: '0.85rem' }}>({dateStr})</span>
                                </div>
                                <div style={{ color: 'var(--bronze)', fontSize: '0.85rem', marginTop: '2px' }}>
                                  {sub.email} · {sub.demographics?.organization || 'Organization not provided'}
                                </div>
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
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recent and searchable all-submissions tables */}
            <div className="big-card" style={{ marginTop: '36px' }}>
              <h2>Submissions</h2>
              <div className="history-tabs admin-submission-tabs" role="tablist" aria-label="Submission lists">
                <button
                  type="button"
                  role="tab"
                  aria-selected={submissionListTab === 'recent'}
                  className={submissionListTab === 'recent' ? 'active' : ''}
                  onClick={() => setSubmissionListTab('recent')}
                >
                  Recent Submissions <span>{stats.recentSubmissions.length}</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={submissionListTab === 'all'}
                  className={submissionListTab === 'all' ? 'active' : ''}
                  onClick={() => setSubmissionListTab('all')}
                >
                  All Submissions <span>{stats.totalSubmissions}</span>
                </button>
              </div>

              {submissionListTab === 'recent' ? (
                <div className="admin-submissions-table-wrap">
                  <table className="sumtable admin-submissions-table">
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
                          <td data-label="Respondent"><b>{s.name}</b></td>
                          <td data-label="Email">{s.email}</td>
                          <td data-label="HuQ Score"><b>{s.huq}/10</b></td>
                          <td data-label="Care Level">{s.careLevel}</td>
                          <td data-label="Type">
                            <span className={`chip ${s.isGuest ? 'guest' : 'user'}`}>
                              {s.isGuest ? 'Guest' : 'User'}
                            </span>
                          </td>
                          <td data-label="Submitted">{new Date(s.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <>
                  {allSubmissionsError && <div className="modal-err" role="alert">{allSubmissionsError}</div>}
                  {allSubmissionsLoading ? (
                    <p role="status">Loading submissions…</p>
                  ) : allSubmissionsError ? null : allSubmissions.length === 0 ? (
                    <p>No submissions to display.</p>
                  ) : (
                    <div className="admin-submissions-table-wrap">
                      <table className="sumtable admin-submissions-table">
                        <thead>
                          <tr>
                            {ALL_SUBMISSION_COLUMNS.map((column) => {
                              const isSorted = allSubmissionsSort.key === column.key;
                              const nextDirection = isSorted && allSubmissionsSort.direction === 'asc' ? 'desc' : 'asc';
                              return (
                                <th
                                  key={column.key}
                                  scope="col"
                                  aria-sort={isSorted ? (allSubmissionsSort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                                >
                                  <button
                                    type="button"
                                    className="admin-sort-button"
                                    aria-label={`Sort by ${column.label} ${nextDirection === 'asc' ? 'ascending' : 'descending'}`}
                                    onClick={() => handleSubmissionSort(column.key)}
                                  >
                                    {column.label}
                                    <span aria-hidden="true">{isSorted ? (allSubmissionsSort.direction === 'asc' ? ' ▲' : ' ▼') : ''}</span>
                                  </button>
                                </th>
                              );
                            })}
                            <th scope="col">Account</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allSubmissions.map((submission) => (
                            <tr key={submission.id}>
                              <td data-label="Respondent"><b>{submission.name}</b></td>
                              <td data-label="Email">{submission.email}</td>
                              <td data-label="Organization">{submission.organization || '—'}</td>
                              <td data-label="HuQ Score"><b>{submission.huq}/10</b></td>
                              <td data-label="Care Level">{submission.careLevel}</td>
                              <td data-label="Test Type">{submission.version === 'quick' ? 'Quick / Beta' : 'Full'}</td>
                              <td data-label="Submitted">{new Date(submission.createdAt).toLocaleString()}</td>
                              <td data-label="Account">
                                <span className={`chip ${submission.isGuest ? 'guest' : 'user'}`}>
                                  {submission.isGuest ? 'Guest' : 'User'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {allSubmissionsPagination?.total > 0 && (
                    <div className="admin-submissions-pagination">
                      <span>
                        Showing {(allSubmissionsPage - 1) * allSubmissionsPagination.limit + (allSubmissions.length ? 1 : 0)}
                        –{(allSubmissionsPage - 1) * allSubmissionsPagination.limit + allSubmissions.length}
                        {' '}of {allSubmissionsPagination.total}
                      </span>
                      <div>
                        <button
                          className="btn ghost"
                          type="button"
                          disabled={allSubmissionsLoading || allSubmissionsPage <= 1}
                          onClick={() => setAllSubmissionsPage((page) => page - 1)}
                        >
                          Previous
                        </button>
                        <span>Page {allSubmissionsPage} of {Math.max(allSubmissionsPagination.totalPages, 1)}</span>
                        <button
                          className="btn ghost"
                          type="button"
                          disabled={allSubmissionsLoading || allSubmissionsPage >= allSubmissionsPagination.totalPages}
                          onClick={() => setAllSubmissionsPage((page) => page + 1)}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
