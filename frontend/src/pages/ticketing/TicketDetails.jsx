import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button/Button';
import Badge from '../../components/common/Badge/Badge';
import { ArrowLeft, Clock, MessageSquare, AlertCircle, User, ShieldAlert, Trash2, Edit2, Check, X, FileText } from 'lucide-react';
import { ticketingApi } from '../../services/ticketingApi';
import '../../styles/ticketingPagesCSS/TicketDetails.css';

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
  
  // Track specific admin/tech dialogs
  const [resolutionPrompt, setResolutionPrompt] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [rejectPrompt, setRejectPrompt] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Comment edit states
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const fetchTicketData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch Ticket
      const tData = await ticketingApi.get(`/tickets/${id}`);
      setTicket(tData);

      // Fetch History
      try {
        const hData = await ticketingApi.get(`/tickets/${id}/history`);
        setHistory(hData);
      } catch (e) { console.error("History fetch failed", e); }

      // Fetch Comments
      try {
        const cData = await ticketingApi.get(`/tickets/${id}/comments`);
        setComments(cData);
      } catch (e) { console.error("Comments fetch failed", e); }
      
      setError(null);
    } catch (err) {
      setError(err.message || 'Ticket not found');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTicketData();
  }, [fetchTicketData]);

  useEffect(() => {
    if (!lightboxSrc) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') setLightboxSrc(null);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [lightboxSrc]);

  // Status Upgrade Actions
  const handleStatusChange = async (newStatus) => {
    setActionLoading(true);
    try {
      const payload = { newStatus };
      
      if (newStatus === 'RESOLVED') {
        payload.resolutionNote = resolutionNote;
        setResolutionPrompt(false);
      }
      if (newStatus === 'REJECTED') {
        payload.rejectionReason = rejectReason;
        setRejectPrompt(false);
      }
      
      await ticketingApi.put(`/tickets/${id}/status`, payload);
      fetchTicketData(); // refresh
    } catch (err) {
      alert(err.message || "Failed to update status. Check workflow rules.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      await ticketingApi.patch(`/tickets/${id}`, { priority: newPriority });
      fetchTicketData();
    } catch (err) { alert(err.message || "Failed to update priority"); }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment permanently?")) return;
    try {
      await ticketingApi.delete(`/tickets/${id}/comments/${commentId}`);
      fetchTicketData();
    } catch (err) { alert(err.message || "Failed to delete comment"); }
  };

  const submitCommentEdit = async (commentId) => {
    try {
      await ticketingApi.put(`/tickets/${id}/comments/${commentId}`, { message: editingCommentText });
      setEditingCommentId(null);
      fetchTicketData();
    } catch (err) { alert(err.message || "Failed to edit comment"); }
  };

  // Post Comment Action
  const COMMENT_MIN = 3;
  const COMMENT_MAX = 500;
  const handlePostComment = async () => {
    if (newComment.trim().length < COMMENT_MIN) return;
    setActionLoading(true);
    try {
      await ticketingApi.post(`/tickets/${id}/comments`, { message: newComment });
      setNewComment('');
      fetchTicketData();
    } catch (err) {
      alert(err.message || "Failed to post comment");
    } finally {
      setActionLoading(false);
    }
  };

  // Assigment Action (Admin Only)
  const handleAssignTech = async (techEmail) => {
    try {
      await ticketingApi.put(`/tickets/${id}/assign`, { assignedTo: techEmail });
      fetchTicketData();
    } catch (err) { alert(err.message || "Failed to assign technician"); }
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
  const isCreator = ticket.createdBy === currentUser.email;
  
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
  const getCreatorName = (value) => MOCK_USERS.find(u => u.email === value || u.id === value)?.name || value;

  return (
    <div className="ticket-detail-container">
      <div className="detail-header-actions">
        <Button variant="ghost" onClick={() => navigate('/tickets')}><ArrowLeft size={18} /> Back</Button>
        <div className="actions-right">
          {/* Admin/Tech Workflow Controls */}
          {isStaff && ticket.status === 'OPEN' && (
             <Button variant="primary" onClick={() => handleStatusChange('IN_PROGRESS')} disabled={actionLoading}>Start Working</Button>
          )}
          
          {isStaff && ticket.status === 'IN_PROGRESS' && !resolutionPrompt && (
             <Button variant="success" onClick={() => setResolutionPrompt(true)} disabled={actionLoading}>Mark Resolved</Button>
          )}

          {currentUser.role === 'ADMIN' && ticket.status !== 'CLOSED' && ticket.status !== 'REJECTED' && !rejectPrompt && (
            <Button variant="outline" onClick={() => setRejectPrompt(true)}>Reject Ticket</Button>
          )}
          {currentUser.role === 'ADMIN' && ticket.status === 'RESOLVED' && (
            <Button variant="ghost" onClick={() => handleStatusChange('CLOSED')}>Close Ticket</Button>
          )}
        </div>
      </div>

      {resolutionPrompt && (
        <div className="inline-prompt">
           <h4>Provide Resolution Note</h4>
           <textarea value={resolutionNote} onChange={e => setResolutionNote(e.target.value)} placeholder="Explain the fix... (min 5 characters)" rows="3" maxLength={500}></textarea>
           <div className="prompt-footer">
             <span className="prompt-char-count">{resolutionNote.length}/500</span>
             {resolutionNote.trim().length > 0 && resolutionNote.trim().length < 5 && <span className="prompt-hint">At least 5 characters required</span>}
           </div>
           <div className="prompt-actions">
              <Button variant="ghost" onClick={() => setResolutionPrompt(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => handleStatusChange('RESOLVED')} disabled={actionLoading || resolutionNote.trim().length < 5}>Complete Resolution</Button>
           </div>
        </div>
      )}

      {rejectPrompt && (
        <div className="inline-prompt prompt-danger">
           <h4>Provide Rejection Reason</h4>
           <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason for rejecting this request... (min 5 characters)" rows="3" maxLength={500}></textarea>
           <div className="prompt-footer">
             <span className="prompt-char-count">{rejectReason.length}/500</span>
             {rejectReason.trim().length > 0 && rejectReason.trim().length < 5 && <span className="prompt-hint">At least 5 characters required</span>}
           </div>
           <div className="prompt-actions">
              <Button variant="ghost" onClick={() => setRejectPrompt(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => handleStatusChange('REJECTED')} disabled={actionLoading || rejectReason.trim().length < 5}>Confirm Rejection</Button>
           </div>
        </div>
      )}

      <div className="detail-grid">
        {/* Main Content Pane */}
        <div className="detail-main">
          <div className="ticket-core">
            <div className="core-header">
              <h1>{ticket.title}</h1>
              <Badge variant={ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? 'success' : 'primary'}>{ticket.status}</Badge>
            </div>
            
            <p className="core-desc">{ticket.description}</p>
            
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="attachments-list">
                <h4>Evidence Attachments ({ticket.attachments.length})</h4>
                <p className="attachments-hint">Thumbnails — click an image to view it full size.</p>
                <div className="file-grid">
                  {ticket.attachments.map((att, idx) => {
                    const isBase64Img = typeof att === 'string' && att.startsWith('data:image/');
                    const isUrl = typeof att === 'string' && /^https?:\/\//i.test(att);
                    const canPreviewImg = isBase64Img || isUrl;
                    return (
                      <div key={idx} className="file-item">
                        {canPreviewImg ? (
                          <button
                            type="button"
                            className="file-item__thumb-btn"
                            onClick={() => setLightboxSrc(att)}
                            aria-label={`View attachment ${idx + 1} full size`}
                            title="View full size"
                          >
                            <img src={att} alt={`Evidence attachment ${idx + 1}`} />
                          </button>
                        ) : (
                          <div className="doc-icon">
                            <FileText size={48} />
                            <span>{String(att)}</span>
                            <span className="doc-icon__note">No image preview</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {ticket.resolutionNote && (
              <div className="resolution-box">
                <h4>Resolution Note</h4>
                <p>{ticket.resolutionNote}</p>
              </div>
            )}
            {ticket.rejectionReason && (
              <div className="rejection-box">
                <h4>Rejection Reason</h4>
                <p>{ticket.rejectionReason}</p>
              </div>
            )}
          </div>

          <div className="comments-section">
            <h3 className="section-title"><MessageSquare size={18} /> Discussion</h3>
            <div className="comment-list">
              {comments.map(c => (
                <div key={c.id} className={`comment-bubble ${c.userId === currentUser.email ? 'mine' : ''}`}>
                  <div className="comment-meta">
                    <strong>{getCreatorName(c.userId)}</strong>
                    <span>{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  
                  {editingCommentId === c.id ? (
                     <div className="edit-mode">
                       <textarea value={editingCommentText} onChange={e => setEditingCommentText(e.target.value)} />
                       <div className="edit-actions">
                         <button onClick={() => setEditingCommentId(null)}><X size={14}/></button>
                         <button onClick={() => submitCommentEdit(c.id)}><Check size={14}/></button>
                       </div>
                     </div>
                  ) : (
                     <div className="comment-body">
                       <p>{c.message}</p>
                       {c.userId === currentUser.email && (
                         <div className="comment-tools">
                           <button onClick={() => { setEditingCommentText(c.message); setEditingCommentId(c.id); }}><Edit2 size={12}/></button>
                           <button onClick={() => deleteComment(c.id)}><Trash2 size={12}/></button>
                         </div>
                       )}
                     </div>
                  )}
                </div>
              ))}
              {comments.length === 0 && <p className="no-comments">No comments yet. Start the discussion!</p>}
            </div>

            <div className="comment-composer">
              <textarea 
                placeholder="Write a comment... (min 3 characters)" 
                value={newComment} onChange={e => setNewComment(e.target.value)}
                rows="3"
                maxLength={COMMENT_MAX}
              />
              <div className="composer-footer">
                <span className="composer-char-count">{newComment.length}/{COMMENT_MAX}</span>
                <Button variant="primary" onClick={handlePostComment} disabled={newComment.trim().length < COMMENT_MIN || actionLoading}>
                  Post Comment
                </Button>
              </div>
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
            {(currentUser.role === 'ADMIN' || currentUser.role === 'TECHNICIAN') && (
              <div className="detail-row" style={currentUser.role === 'ADMIN' ? { flexDirection: 'column', alignItems: 'flex-start', gap: '8px' } : {}}>
                <span>Priority</span>
                {currentUser.role === 'ADMIN' ? (
                  <select
                    value={ticket.priority}
                    onChange={(e) => handlePriorityChange(e.target.value)}
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                ) : (
                  <strong>{ticket.priority}</strong>
                )}
              </div>
            )}
            <div className="detail-row">
              <span>Location</span>
              <strong>{ticket.location}</strong>
            </div>
            <div className="detail-row">
              <span>Requester</span>
              <strong style={{display: 'flex', gap: '6px', alignItems: 'center'}}><User size={14}/> {getCreatorName(ticket.createdBy)}</strong>
            </div>
            <div className="detail-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
              <span>Assigned To</span>
              
              {(currentUser.role === 'ADMIN' && (ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS')) ? (
                <select 
                   value={ticket.assignedTo || ''} 
                   onChange={(e) => handleAssignTech(e.target.value)}
                   style={{ width: '100%', padding: '6px', borderRadius: '4px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                >
                  <option value="" disabled>Select Technician</option>
                  {MOCK_USERS.filter(u => u.role === 'TECHNICIAN').map(tech => (
                    <option key={tech.id} value={tech.email}>{tech.name}</option>
                  ))}
                </select>
              ) : (
                <strong>{ticket.assignedTo ? getCreatorName(ticket.assignedTo) : 'Unassigned'}</strong>
              )}
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

      {lightboxSrc && (
        <div
          className="attachment-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Full size attachment"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            type="button"
            className="attachment-lightbox__close"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxSrc(null);
            }}
            aria-label="Close preview"
          >
            <X size={28} />
          </button>
          <div
            className="attachment-lightbox__frame"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={lightboxSrc} alt="Full size evidence attachment" />
          </div>
        </div>
      )}
    </div>
  );
}

export default TicketDetails;
