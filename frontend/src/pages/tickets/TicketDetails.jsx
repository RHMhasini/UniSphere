import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button/Button';
import Badge from '../../components/common/Badge/Badge';
import { ArrowLeft, Clock, MessageSquare, AlertCircle, User, ShieldAlert } from 'lucide-react';
import './TicketDetails.css';

// Utility for Time Gap calculations (SLA requirement)
const formatTimeGap = (startStr, endStr) => {
  const start = new Date(startStr);
  const end = endStr ? new Date(endStr) : new Date();
  const gapMs = end - start;
  
  if (gapMs < 60000) return 'Just now';
  
  const hours = Math.floor(gapMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  const minutes = Math.floor((gapMs % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${remainingHours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, MOCK_USERS } = useAuth();
  
  const [ticket, setTicket] = useState(null);
  const [history, setHistory] = useState([]);
  const [comments, setComments] = useState([]);
  
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTicketData();
  }, [id]);

  const fetchTicketData = async () => {
    try {
      setLoading(true);
      // Fetch Ticket
      const tRes = await fetch(`http://localhost:8080/api/tickets/${id}`);
      if (!tRes.ok) throw new Error('Ticket not found');
      const tData = await tRes.json();
      setTicket(tData);

      // Fetch History
      const hRes = await fetch(`http://localhost:8080/api/tickets/${id}/history`);
      if (hRes.ok) setHistory(await hRes.json());

      // Fetch Comments
      const cRes = await fetch(`http://localhost:8080/api/tickets/${id}/comments`);
      if (cRes.ok) setComments(await cRes.json());
      
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Status Upgrade Actions
  const handleStatusChange = async (newStatus) => {
    setActionLoading(true);
    try {
      const payload = { newStatus, changedBy: currentUser.id };
      if (newStatus === 'RESOLVED') payload.resolutionNote = "Resolved by technician.";
      
      const res = await fetch(`http://localhost:8080/api/tickets/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) fetchTicketData(); // refresh
    } finally {
      setActionLoading(false);
    }
  };

  // Post Comment Action
  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/tickets/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, message: newComment })
      });
      if (res.ok) {
        setNewComment('');
        fetchTicketData();
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="loading-state"><div className="spinner"></div></div>;
  if (error) return <div className="error-state"><AlertCircle size={48} /><h3>{error}</h3><Button onClick={() => navigate('/tickets')}>Back to Tickets</Button></div>;

  // -- SECURITY & LOGICAL FLOW RULES --
  
  // Rule 1: A ticket is "General" if it's FACILITY (publicly visible). Otherwise it's "Specific" (private).
  const isGeneral = ticket.category === 'FACILITY';
  
  // Rule 2: Can Current User view this ticket?
  // Admins & Techs can view everything. 
  // Students/Lecturers can view ONLY if it's General, OR if they created it.
  const isStaff = currentUser.role === 'ADMIN' || currentUser.role === 'TECHNICIAN';
  const isCreator = ticket.createdBy === currentUser.id;
  
  if (!isStaff && !isGeneral && !isCreator) {
    return (
      <div className="error-state">
        <ShieldAlert size={48} />
        <h3>Access Denied</h3>
        <p>This is a specific issue raised by another user. You do not have permission to view it.</p>
        <Button onClick={() => navigate('/tickets')}>Back to Tickets</Button>
      </div>
    );
  }

  // Find User Names for displays
  const getCreatorName = (uid) => MOCK_USERS.find(u => u.id === uid)?.name || uid;

  return (
    <div className="ticket-detail-container">
      <div className="detail-header-actions">
        <Button variant="ghost" onClick={() => navigate('/tickets')}><ArrowLeft size={18} /> Back</Button>
        <div className="actions-right">
          {/* Admin/Tech Workflow Controls */}
          {isStaff && ticket.status === 'OPEN' && (
             <Button variant="primary" onClick={() => handleStatusChange('IN_PROGRESS')} disabled={actionLoading}>Start Working</Button>
          )}
          {isStaff && ticket.status === 'IN_PROGRESS' && (
             <Button variant="primary" onClick={() => handleStatusChange('RESOLVED')} disabled={actionLoading}>Mark Resolved</Button>
          )}
        </div>
      </div>

      <div className="detail-grid">
        {/* Main Content Pane */}
        <div className="detail-main">
          <div className="ticket-core">
            <div className="core-header">
              <h1>{ticket.title}</h1>
              <Badge variant={ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? 'success' : 'primary'}>{ticket.status}</Badge>
            </div>
            
            <p className="core-desc">{ticket.description}</p>
            
            {ticket.resolutionNote && (
              <div className="resolution-box">
                <h4>Resolution Note</h4>
                <p>{ticket.resolutionNote}</p>
              </div>
            )}
          </div>

          <div className="comments-section">
            <h3 className="section-title"><MessageSquare size={18} /> Discussion</h3>
            <div className="comment-list">
              {comments.map(c => (
                <div key={c.id} className={`comment-bubble ${c.userId === currentUser.id ? 'mine' : ''}`}>
                  <div className="comment-meta">
                    <strong>{getCreatorName(c.userId)}</strong>
                    <span>{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <p>{c.message}</p>
                </div>
              ))}
              {comments.length === 0 && <p className="no-comments">No comments yet. Start the discussion!</p>}
            </div>

            <div className="comment-composer">
              <textarea 
                placeholder="Write a comment..." 
                value={newComment} onChange={e => setNewComment(e.target.value)}
                rows="3"
              />
              <Button variant="primary" onClick={handlePostComment} disabled={!newComment.trim() || actionLoading}>
                Post Comment
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar Pane */}
        <div className="detail-sidebar">
          <div className="sidebar-card">
            <h3>Details</h3>
            <div className="detail-row">
              <span>Category</span>
              <strong>{ticket.category}</strong>
            </div>
            <div className="detail-row">
              <span>Priority</span>
              <strong>{ticket.priority}</strong>
            </div>
            <div className="detail-row">
              <span>Location</span>
              <strong>{ticket.location}</strong>
            </div>
            <div className="detail-row">
              <span>Requester</span>
              <strong style={{display: 'flex', gap: '6px', alignItems: 'center'}}><User size={14}/> {getCreatorName(ticket.createdBy)}</strong>
            </div>
            <div className="detail-row">
              <span>Assigned To</span>
              <strong>{ticket.assignedTo ? getCreatorName(ticket.assignedTo) : 'Unassigned'}</strong>
            </div>
          </div>

          <div className="sidebar-card timeline-card">
            <h3><Clock size={16} /> SLA Timeline & History</h3>
            <div className="timeline">
              <div className="timeline-event">
                <div className="timeline-dot bg-accent"></div>
                <div className="timeline-content">
                  <h4>Ticket Created</h4>
                  <span className="time">{new Date(ticket.createdAt).toLocaleString()}</span>
                </div>
              </div>
              
              {history.map((h, i) => {
                // Calculate time gap from previous event or creation time
                const prevTime = i === 0 ? ticket.createdAt : history[i-1].changedAt;
                const gap = formatTimeGap(prevTime, h.changedAt);
                
                return (
                  <div className="timeline-event" key={h.id}>
                    <div className="timeline-line"></div>
                    <div className="timeline-gap-pill">{gap} later</div>
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <h4>Status changed to {h.newStatus}</h4>
                      <span className="time">{new Date(h.changedAt).toLocaleString()} by {getCreatorName(h.changedBy)}</span>
                    </div>
                  </div>
                );
              })}
              
              {/* Active gap ticker if not closed */}
              {ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && ticket.status !== 'REJECTED' && (
                <div className="timeline-event">
                  <div className="timeline-line"></div>
                  <div className="timeline-gap-pill active-ticker">
                    Open for {formatTimeGap(ticket.createdAt, new Date().toISOString())}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TicketDetails;
