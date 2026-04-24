import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Badge from '../../common/Badge/Badge';
import { Calendar, MapPin, AlertCircle } from 'lucide-react';
import './TicketCard.css';

const getStatusVariant = (status) => {
  switch (status) {
    case 'OPEN': return 'primary';
    case 'IN_PROGRESS': return 'warning';
    case 'RESOLVED': return 'success';
    case 'CLOSED': return 'neutral';
    case 'REJECTED': return 'danger';
    default: return 'neutral';
  }
};

function TicketCard({ ticket }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role || '';

  const dateFormatted = new Date(ticket.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  // Navigate into the right section depending on role
  const basePath = (role === 'ADMIN' || role === 'TECHNICIAN') ? '/dashboard/tickets' : '/dashboard/mytickets';

  return (
    <div className="ticket-card" onClick={() => navigate(`${basePath}/${ticket.id}`)}>
      <div className="ticket-card-header">

        <h3 className="ticket-title">{ticket.title}</h3>
        <Badge variant={getStatusVariant(ticket.status)}>{ticket.status.replace('_', ' ')}</Badge>
      </div>
      
      <p className="ticket-description">{ticket.description}</p>
      
      <div className="ticket-meta">
        {(role === 'ADMIN' || role === 'TECHNICIAN') && (
          <div className="meta-item">
            <AlertCircle size={16} />
            <span className={`priority-${ticket.priority.toLowerCase()}`}>
              {ticket.priority} Priority
            </span>
          </div>
        )}
        <div className="meta-item">
          <MapPin size={16} />
          <span>{ticket.location}</span>
        </div>
        <div className="meta-item">
          <Calendar size={16} />
          <span>{dateFormatted}</span>
        </div>
      </div>
      
      <div className="ticket-footer">
        <div className="category-tag">{ticket.category}</div>
        <div className="assignee-tag">
          {ticket.assignedTo ? `Assigned to ${ticket.assignedTo}` : 'Unassigned'}
        </div>
      </div>
    </div>
  );
}

export default TicketCard;
