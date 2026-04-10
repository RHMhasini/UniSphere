import React from 'react';
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

const getPriorityVariant = (priority) => {
  switch (priority) {
    case 'LOW': return 'neutral';
    case 'MEDIUM': return 'primary';
    case 'HIGH': return 'warning';
    case 'URGENT': return 'danger';
    default: return 'neutral';
  }
};

function TicketCard({ ticket }) {
  const dateFormatted = new Date(ticket.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <div className="ticket-card">
      <div className="ticket-card-header">
        <h3 className="ticket-title">{ticket.title}</h3>
        <Badge variant={getStatusVariant(ticket.status)}>{ticket.status.replace('_', ' ')}</Badge>
      </div>
      
      <p className="ticket-description">{ticket.description}</p>
      
      <div className="ticket-meta">
        <div className="meta-item">
          <AlertCircle size={16} />
          <span className={`priority-${ticket.priority.toLowerCase()}`}>
            {ticket.priority} Priority
          </span>
        </div>
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
