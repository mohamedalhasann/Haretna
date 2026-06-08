  import React, { useEffect, useState } from 'react'
import './styles.css'

const API = 'http://127.0.0.1:8000/api'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [user, setUser] = useState(localStorage.getItem('user') || '')
  const [page, setPage] = useState(token ? 'home' : 'auth')
  const [issues, setIssues] = useState([])
  const [events, setEvents] = useState([])
  const [stats, setStats] = useState({ total: 0, open: 0, adopted: 0, closed: 0 })
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState('')

  useEffect(() => {
    if (token) {
      fetchIssues()
      fetchEvents()
    }
  }, [token])

  function apiHeaders() {
    const h = { 'Content-Type': 'application/json' }
    if (token) h['Authorization'] = `Token ${token}`
    return h
  }

  function showNotification(msg, duration = 3000) {
    setNotification(msg)
    setTimeout(() => setNotification(''), duration)
  }

  function fetchIssues() {
    setLoading(true)
    fetch(`${API}/issues/`, { headers: apiHeaders() })
      .then(r => r.json())
      .then(data => {
        setIssues(data)
        setStats({
          total: data.length,
          open: data.filter(i => i.status === 'Open').length,
          adopted: data.filter(i => i.status === 'Adopted').length,
          closed: data.filter(i => i.status === 'Closed').length
        })
      })
      .catch(err => {
        showNotification('❌ Failed to load issues')
      })
      .finally(() => setLoading(false))
  }

  function fetchEvents() {
    fetch(`${API}/events/`, { headers: apiHeaders() })
      .then(r => r.json())
      .then(setEvents)
      .catch(() => setEvents([]))
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken('')
    setUser('')
    setPage('auth')
    showNotification('👋 Logged out successfully')
  }

  return (
    <div className="app-wrapper">
      {notification && <Notification msg={notification} />}
      {token && <Nav user={user} onLogout={logout} onPageChange={setPage} currentPage={page} />}
      
      <HomePage page={page} issues={issues} events={events} onRefresh={fetchIssues} stats={stats} token={token} apiHeaders={apiHeaders} setPage={setPage} loading={loading} showNotification={showNotification} />
      <ReportPage page={page} onSubmit={() => { fetchIssues(); setPage('home'); showNotification('✅ Issue reported successfully!') }} token={token} apiHeaders={apiHeaders} showNotification={showNotification} />
      <EventsPage page={page} onRefresh={fetchEvents} token={token} apiHeaders={apiHeaders} events={events} showNotification={showNotification} />
      <CallToActionPage page={page} token={token} apiHeaders={apiHeaders} onAdopt={() => fetchIssues()} showNotification={showNotification} />
      <LeaderboardPage page={page} issues={issues} events={events} />
      <AuthPage page={page} onAuth={(t, u) => { setToken(t); setUser(u); setPage('home'); localStorage.setItem('token', t); localStorage.setItem('user', u); showNotification(`🎉 Welcome, ${u}!`) }} showNotification={showNotification} />
    </div>
  )
}

function Notification({ msg }) {
  return <div className="notification">{msg}</div>
}

function Nav({ user, onLogout, onPageChange, currentPage }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  
  return (
    <div className="nav">
      <div className="nav-container">
        <a className="nav-brand" href="#" onClick={e => { e.preventDefault(); onPageChange('home') }}>
          🌍 Haretna
        </a>
        <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>☰</button>
        <ul className={`nav-links ${mobileOpen ? 'open' : ''}`}>
          {['home', 'report', 'events', 'cta', 'leaderboard'].map(p => (
            <li key={p}>
              <a 
                href="#" 
                onClick={e => { e.preventDefault(); onPageChange(p); setMobileOpen(false) }} 
                className={currentPage === p ? 'active' : ''}
              >
                {p === 'home' ? '📋 Issues' : p === 'report' ? '🆕 Report' : p === 'events' ? '👥 Events' : p === 'cta' ? '🚨 Call to Action' : '🏆 Leaderboard'}
              </a>
            </li>
          ))}
        </ul>
        <div className="nav-user">
          <span className="user-badge">👤 {user}</span>
          <button className="btn btn-secondary btn-sm" onClick={onLogout}>Logout</button>
        </div>
      </div>
    </div>
  )
}

function HomePage({ page, issues, events, onRefresh, stats, token, apiHeaders, setPage, loading, showNotification }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  if (page !== 'home') return null

  const filtered = issues.filter(i => {
    const matchFilter = filter === 'all' || i.status === (filter === 'open' ? 'Open' : filter === 'adopted' ? 'Adopted' : 'Closed')
    const matchSearch = i.title.toLowerCase().includes(search.toLowerCase()) || i.neighborhood.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <div className="container">
      <div className="page-header">
        <h1>🏘️ Neighborhood Issues</h1>
        <p className="subtitle">Join your community and make a difference</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-box" onClick={() => setFilter('all')}>
          <div className="stat-icon">📊</div>
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Issues</div>
        </div>
        <div className="stat-box" onClick={() => setFilter('open')}>
          <div className="stat-icon">🔴</div>
          <div className="stat-number">{stats.open}</div>
          <div className="stat-label">Open</div>
        </div>
        <div className="stat-box" onClick={() => setFilter('adopted')}>
          <div className="stat-icon">🟢</div>
          <div className="stat-number">{stats.adopted}</div>
          <div className="stat-label">Adopted</div>
        </div>
        <div className="stat-box" onClick={() => setFilter('closed')}>
          <div className="stat-icon">✅</div>
          <div className="stat-number">{stats.closed}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      <div className="action-bar">
        <input 
          type="text" 
          placeholder="🔍 Search issues..." 
          className="search-input"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="btn btn-primary" onClick={onRefresh} disabled={loading}>
          {loading ? '⟳ Loading...' : '🔄 Refresh'}
        </button>
        <button className="btn btn-success" onClick={() => setPage('report')}>➕ Report Issue</button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>{search ? 'No issues match your search.' : 'No issues reported yet.'}</p>
          <button className="btn btn-primary" onClick={() => setPage('report')}>Be the first to report!</button>
        </div>
      ) : (
        <div className="issues-grid">
          {filtered.map(issue => (
            <IssueCard key={issue.id} issue={issue} apiHeaders={apiHeaders} onUpdate={onRefresh} showNotification={showNotification} />
          ))}
        </div>
      )}
    </div>
  )
}

function IssueCard({ issue, apiHeaders, onUpdate, showNotification }) {
  const [adopting, setAdopting] = useState(false)

  const categoryIcons = {
    'Cleanup': '🧹',
    'Painting': '🎨',
    'Planting': '🌱',
    'Maintenance': '🔧',
    'Other': '📌'
  }

  function handleAdopt() {
    setAdopting(true)
    fetch(`${API}/issues/${issue.id}/adopt/`, {
      method: 'POST',
      headers: apiHeaders()
    })
      .then(r => r.json())
      .then(() => {
        showNotification(`✅ Adopted "${issue.title}"!`)
        onUpdate()
      })
      .catch(() => showNotification('❌ Failed to adopt issue'))
      .finally(() => setAdopting(false))
  }

  const statusColor = issue.status === 'Open' ? '#ea580c' : issue.status === 'Adopted' ? '#16a34a' : '#666'
  const daysOld = Math.floor((Date.now() - new Date(issue.reported_at)) / (1000 * 60 * 60 * 24))

  return (
    <div className="issue-card">
      <div className="issue-header">
        <div className="issue-title-block">
          <span className="category-icon">{categoryIcons[issue.category] || '📌'}</span>
          <h3>{issue.title}</h3>
        </div>
        <span className="status-badge" style={{ backgroundColor: statusColor }}>
          {issue.status}
        </span>
      </div>

      <div className="issue-meta">
        <span>📍 {issue.neighborhood}</span>
        <span>⏰ {daysOld} days ago</span>
        <span>{issue.category}</span>
      </div>

      <p className="issue-description">{issue.description}</p>

      {issue.supplies && (
        <div className="issue-supplies">
          <strong>📦 Needs:</strong>
          <div className="supplies-list">
            {issue.supplies.split('\n').filter(s => s.trim()).map((item, i) => (
              <span key={i} className="supply-tag">🏷️ {item}</span>
            ))}
          </div>
        </div>
      )}

      {issue.adopted_by && (
        <div className="issue-adopted">
          <strong>👥 Adopted by:</strong> {issue.adopted_by}
        </div>
      )}

      {issue.status === 'Open' && (
        <button 
          className="btn btn-primary btn-adopt" 
          onClick={handleAdopt}
          disabled={adopting}
        >
          {adopting ? '⟳ Adopting...' : '💪 Adopt This Issue'}
        </button>
      )}
    </div>
  )
}

function ReportPage({ page, onSubmit, token, apiHeaders, showNotification }) {
  const [form, setForm] = useState({ title: '', category: 'Cleanup', neighborhood: '', description: '', supplies: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  if (page !== 'report') return null

  function validate() {
    const newErrors = {}
    if (!form.title.trim()) newErrors.title = 'Title is required'
    if (!form.neighborhood.trim()) newErrors.neighborhood = 'Neighborhood is required'
    if (!form.description.trim()) newErrors.description = 'Description is required'
    if (form.description.length < 10) newErrors.description = 'Description must be at least 10 characters'
    return newErrors
  }

  function handleSubmit(e) {
    e.preventDefault()
    const newErrors = validate()
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      showNotification('⚠️ Please fill in all required fields correctly')
      return
    }

    setLoading(true)
    fetch(`${API}/issues/`, {
      method: 'POST',
      headers: apiHeaders(),
      body: JSON.stringify(form)
    })
      .then(r => {
        if (!r.ok) throw new Error('Failed to report')
        return r.json()
      })
      .then(() => {
        setForm({ title: '', category: 'Cleanup', neighborhood: '', description: '', supplies: '' })
        setErrors({})
        onSubmit()
      })
      .catch(err => showNotification('❌ ' + err.message))
      .finally(() => setLoading(false))
  }

  return (
    <div className="container" style={{ maxWidth: '700px' }}>
      <div className="page-header">
        <h1>📝 Report a Neighborhood Issue</h1>
        <p className="subtitle">Help improve your community by reporting problems</p>
      </div>

      <form onSubmit={handleSubmit} className="report-form">
        <div className="form-group">
          <label>Issue Title * <span className="required">Required</span></label>
          <input 
            placeholder="e.g., Pothole on Main Street" 
            value={form.title} 
            onChange={e => { setForm({ ...form, title: e.target.value }); delete errors.title }}
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <span className="error-text">{errors.title}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category *</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option>Cleanup</option>
              <option>Painting</option>
              <option>Planting</option>
              <option>Maintenance</option>
              <option>Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Neighborhood *</label>
            <input 
              placeholder="e.g., Downtown, West Side" 
              value={form.neighborhood} 
              onChange={e => { setForm({ ...form, neighborhood: e.target.value }); delete errors.neighborhood }}
              className={errors.neighborhood ? 'error' : ''}
            />
            {errors.neighborhood && <span className="error-text">{errors.neighborhood}</span>}
          </div>
        </div>

        <div className="form-group">
          <label>Detailed Description * <span className="char-count">{form.description.length}/500</span></label>
          <textarea 
            placeholder="Describe the issue in detail... What needs to be done?" 
            value={form.description} 
            onChange={e => { setForm({ ...form, description: e.target.value.slice(0, 500) }); delete errors.description }}
            maxLength="500"
            rows="5"
            className={errors.description ? 'error' : ''}
          />
          {errors.description && <span className="error-text">{errors.description}</span>}
        </div>

        <div className="form-group">
          <label>📦 Needed Supplies (optional)</label>
          <textarea 
            placeholder="List items needed (one per line)&#10;e.g., Trash bags&#10;Gloves&#10;Rake" 
            value={form.supplies} 
            onChange={e => setForm({ ...form, supplies: e.target.value })}
            rows="3"
          />
          <small>Tip: Items you list here will help volunteers prepare for the cleanup</small>
        </div>

        <button type="submit" className="btn btn-success btn-lg" disabled={loading}>
          {loading ? '⟳ Submitting...' : '✅ Submit Report'}
        </button>
      </form>
    </div>
  )
}

function EventsPage({ page, onRefresh, token, apiHeaders, events, showNotification }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', date: '', location: '', volunteers_needed: '' })
  const [loading, setLoading] = useState(false)
  const [joined, setJoined] = useState(new Set())

  if (page !== 'events') return null

  function handleJoin(eventId) {
    if (joined.has(eventId)) return

    fetch(`${API}/events/${eventId}/join/`, {
      method: 'POST',
      headers: apiHeaders()
    })
      .then(r => r.json())
      .then(() => {
        setJoined(new Set([...joined, eventId]))
        showNotification('✅ You signed up for the event!')
        onRefresh()
      })
      .catch(() => showNotification('❌ Failed to join event'))
  }

  function handleCreateEvent(e) {
    e.preventDefault()
    if (!form.title || !form.date || !form.location) {
      showNotification('⚠️ Please fill in all required fields')
      return
    }

    setLoading(true)
    fetch(`${API}/events/`, {
      method: 'POST',
      headers: apiHeaders(),
      body: JSON.stringify({ ...form, volunteers_needed: parseInt(form.volunteers_needed) || 5 })
    })
      .then(r => r.json())
      .then(() => {
        setForm({ title: '', description: '', date: '', location: '', volunteers_needed: '' })
        setShowForm(false)
        showNotification('🎉 Event created successfully!')
        onRefresh()
      })
      .catch(() => showNotification('❌ Failed to create event'))
      .finally(() => setLoading(false))
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>👥 Volunteer Events</h1>
        <p className="subtitle">Join organized cleanup and improvement events</p>
      </div>

      {!showForm && (
        <button className="btn btn-success btn-lg" onClick={() => setShowForm(true)}>
          📅 Schedule New Event
        </button>
      )}

      {showForm && (
        <div className="event-form card">
          <h3>Create an Event</h3>
          <form onSubmit={handleCreateEvent}>
            <div className="form-group">
              <label>Event Title *</label>
              <input 
                placeholder="e.g., Park Cleanup Day" 
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea 
                placeholder="What will this event be about?" 
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows="3"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date & Time *</label>
                <input 
                  type="datetime-local" 
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Volunteers Needed *</label>
                <input 
                  type="number" 
                  min="1"
                  placeholder="5"
                  value={form.volunteers_needed}
                  onChange={e => setForm({ ...form, volunteers_needed: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Location *</label>
              <input 
                placeholder="e.g., Central Park, Downtown" 
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? '⟳ Creating...' : '✅ Create Event'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <p>No events scheduled yet. Be the first to organize one!</p>
        </div>
      ) : (
        <div className="events-grid">
          {events.map(evt => (
            <div key={evt.id} className="event-card">
              <div className="event-header">
                <h3>{evt.title}</h3>
                <span className="volunteer-badge">👥 {evt.volunteers.length}/{evt.volunteers_needed}</span>
              </div>

              {evt.description && <p className="event-description">{evt.description}</p>}

              <div className="event-details">
                <div className="event-detail">
                  <span>📅</span>
                  <span>{new Date(evt.date).toLocaleDateString()}</span>
                </div>
                <div className="event-detail">
                  <span>🕐</span>
                  <span>{new Date(evt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="event-detail">
                  <span>📍</span>
                  <span>{evt.location}</span>
                </div>
              </div>

              <button 
                className={`btn ${joined.has(evt.id) ? 'btn-secondary' : 'btn-primary'} btn-block`}
                onClick={() => handleJoin(evt.id)}
                disabled={joined.has(evt.id)}
              >
                {joined.has(evt.id) ? '✅ You\'re Signed Up' : '🙋 Sign Up for Event'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CallToActionPage({ page, token, apiHeaders, onAdopt, showNotification }) {
  const [cta, setCta] = useState([])
  const [adopting, setAdopting] = useState(new Set())

  if (page !== 'cta') return null

  React.useEffect(() => {
    fetch(`${API}/issues/call_to_action/`, { headers: apiHeaders() })
      .then(r => r.json())
      .then(setCta)
      .catch(() => setCta([]))
  }, [])

  function handleAdopt(issueId) {
    setAdopting(new Set([...adopting, issueId]))
    fetch(`${API}/issues/${issueId}/adopt/`, {
      method: 'POST',
      headers: apiHeaders()
    })
      .then(r => r.json())
      .then(() => {
        showNotification('💪 Issue adopted! Great initiative!')
        onAdopt()
        setCta(cta.filter(c => c.id !== issueId))
      })
      .catch(() => showNotification('❌ Failed to adopt issue'))
      .finally(() => setAdopting(new Set([...adopting].filter(id => id !== issueId))))
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>🚨 Call to Action</h1>
        <p className="subtitle">Issues that need urgent community attention</p>
      </div>

      <div className="alert alert-warning">
        <strong>⏰ Urgent!</strong> These issues have been waiting for 14+ days without an organization to adopt them. Your community needs you!
      </div>

      {cta.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🌟</div>
          <p>No urgent issues at this time. Great work, community!</p>
          <p className="subtitle">Your neighborhood is in great hands</p>
        </div>
      ) : (
        <div className="cta-grid">
          {cta.map(issue => {
            const daysOld = Math.floor((Date.now() - new Date(issue.reported_at)) / (1000 * 60 * 60 * 24))
            const urgency = daysOld > 30 ? 'critical' : daysOld > 21 ? 'high' : 'medium'
            
            return (
              <div key={issue.id} className={`cta-card urgency-${urgency}`}>
                <div className="urgency-indicator">
                  {urgency === 'critical' && '🔴 CRITICAL'}
                  {urgency === 'high' && '🟠 HIGH PRIORITY'}
                  {urgency === 'medium' && '🟡 ATTENTION NEEDED'}
                </div>

                <h3>{issue.title}</h3>

                <div className="cta-meta">
                  <div className="meta-item">
                    <span>📍</span>
                    <strong>{issue.neighborhood}</strong>
                  </div>
                  <div className="meta-item">
                    <span>⏱️</span>
                    <strong>{daysOld} days waiting</strong>
                  </div>
                </div>

                <p>{issue.description}</p>

                {issue.supplies && (
                  <div className="cta-supplies">
                    <strong>📦 Needed Items:</strong>
                    <div className="supplies-list">
                      {issue.supplies.split('\n').filter(s => s.trim()).map((item, i) => (
                        <span key={i} className="supply-tag">{item}</span>
                      ))}
                    </div>
                  </div>
                )}

                <button 
                  className="btn btn-danger btn-lg btn-block"
                  onClick={() => handleAdopt(issue.id)}
                  disabled={adopting.has(issue.id)}
                >
                  {adopting.has(issue.id) ? '⟳ Adopting...' : '💪 Adopt Now & Make a Difference'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function LeaderboardPage({ page, issues, events }) {
  if (page !== 'leaderboard') return null

  const neighborhoods = {}
  const adoptedCounts = {}
  
  issues.forEach(i => {
    neighborhoods[i.neighborhood] = (neighborhoods[i.neighborhood] || 0) + 1
    if (i.status === 'Adopted' || i.status === 'Closed') {
      adoptedCounts[i.neighborhood] = (adoptedCounts[i.neighborhood] || 0) + 1
    }
  })

  const sorted = Object.entries(neighborhoods)
    .map(([name, count]) => ({
      name,
      total: count,
      adopted: adoptedCounts[name] || 0,
      completion: adoptedCounts[name] ? Math.round((adoptedCounts[name] / count) * 100) : 0
    }))
    .sort((a, b) => b.completion - a.completion)

  return (
    <div className="container">
      <div className="page-header">
        <h1>🏆 Community Leaderboard</h1>
        <p className="subtitle">Celebrating neighborhoods making a difference</p>
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏘️</div>
          <p>No data yet. Start reporting and adopting issues to build the leaderboard!</p>
        </div>
      ) : (
        <div className="leaderboard">
          {sorted.map((neighborhood, idx) => (
            <div key={idx} className={`leaderboard-row rank-${idx + 1}`}>
              <div className="rank-badge">
                {idx === 0 && '🥇'}
                {idx === 1 && '🥈'}
                {idx === 2 && '🥉'}
                {idx > 2 && `#${idx + 1}`}
              </div>

              <div className="neighborhood-info">
                <div className="neighborhood-name">{neighborhood.name}</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${neighborhood.completion}%` }}>
                    <span className="progress-text">{neighborhood.completion}%</span>
                  </div>
                </div>
              </div>

              <div className="stats-summary">
                <div className="stat">
                  <span className="stat-label">Issues</span>
                  <span className="stat-value">{neighborhood.total}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Adopted</span>
                  <span className="stat-value highlight">{neighborhood.adopted}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AuthPage({ page, onAuth, showNotification }) {
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  if (page !== 'auth') return null

  function validate() {
    const newErrors = {}
    if (!form.username.trim()) newErrors.username = 'Username required'
    if (!form.password) newErrors.password = 'Password required'
    if (tab === 'register' && !form.email) newErrors.email = 'Email required'
    return newErrors
  }

  function handleSubmit(e) {
    e.preventDefault()
    const newErrors = validate()
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    const endpoint = tab === 'login' ? '/auth/login/' : '/auth/register/'
    const body = tab === 'login' ? { username: form.username, password: form.password } : form

    fetch(`${API}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(r => r.json())
      .then(data => {
        if (data.token) {
          onAuth(data.token, form.username)
        } else {
          setErrors({ form: data.detail || JSON.stringify(data) })
          showNotification('❌ ' + (data.detail || 'Error'))
        }
      })
      .catch(err => {
        showNotification('❌ Connection error')
      })
      .finally(() => setLoading(false))
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>🌍 Haretna</h1>
            <p>Community Action Platform</p>
          </div>

          <div className="auth-tabs">
            <button 
              className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
              onClick={() => { setTab('login'); setErrors({}) }}
            >
              🔓 Sign In
            </button>
            <button 
              className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
              onClick={() => { setTab('register'); setErrors({}) }}
            >
              ✨ Join Us
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input 
                value={form.username} 
                onChange={e => { setForm({ ...form, username: e.target.value }); delete errors.username }}
                placeholder="Choose a username"
                className={errors.username ? 'error' : ''}
              />
              {errors.username && <span className="error-text">{errors.username}</span>}
            </div>

            {tab === 'register' && (
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={form.email} 
                  onChange={e => { setForm({ ...form, email: e.target.value }); delete errors.email }}
                  placeholder="your@email.com"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
            )}

            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                value={form.password} 
                onChange={e => { setForm({ ...form, password: e.target.value }); delete errors.password }}
                placeholder="Enter a secure password"
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            {errors.form && <div className="error-box">{errors.form}</div>}

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
              {loading ? '⟳ Loading...' : (tab === 'login' ? '🔓 Sign In' : '✨ Create Account')}
            </button>
          </form>

          <div className="auth-footer">
            <p className="subtitle">Join thousands making your community better!</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
