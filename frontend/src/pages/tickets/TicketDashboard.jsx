import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, LayoutGrid, List as ListIcon } from 'lucide-react';
import TicketCard from '../../components/tickets/TicketCard/TicketCard';
import Button from '../../components/common/Button/Button';
import './TicketDashboard.css';

function TicketDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL'); // ALL, OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED
  
  // Simulated admin user session
  const currentUserRole = 'ADMIN'; 

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/tickets');
      if (!response.ok) throw new Error('Failed to fetch tickets');
      const data = await response.json();
      // Handle the wrapping structure from our backend serialization or plain array
      const ticketsArray = data.value || data;
      setTickets(Array.isArray(ticketsArray) ? ticketsArray : []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = filter === 'ALL' 
    ? tickets 
    : tickets.filter(t => t.status === filter);

  // Group stats
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED').length,
  };

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Tickets & Maintenance</h1>
          <p className="dashboard-subtitle">Manage campus facility, software, and hardware requests.</p>
        </div>
        <div className="dashboard-actions">
          <Button variant="outline">
            <Filter size={18} /> Filter
          </Button>
          <Button variant="primary">
            <Plus size={18} /> New Ticket
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => setFilter('ALL')}>
          <h3>Total Requests</h3>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card stat-open" onClick={() => setFilter('OPEN')}>
          <h3>Open</h3>
          <div className="stat-value">{stats.open}</div>
        </div>
        <div className="stat-card stat-progress" onClick={() => setFilter('IN_PROGRESS')}>
          <h3>In Progress</h3>
          <div className="stat-value">{stats.inProgress}</div>
        </div>
        <div className="stat-card stat-resolved" onClick={() => setFilter('RESOLVED')}>
          <h3>Resolved</h3>
          <div className="stat-value">{stats.resolved}</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-content">
        <div className="content-toolbar">
          <div className="search-bar">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Search tickets by title or ID..." 
              className="search-input"
            />
          </div>
          
          <div className="view-toggles">
            <button className="toggle-btn active"><LayoutGrid size={20} /></button>
            <button className="toggle-btn"><ListIcon size={20} /></button>
          </div>
        </div>

        {/* Tickets Grid */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading tickets...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <AlertCircle size={48} />
            <h3>Connection Error</h3>
            <p>{error}</p>
            <Button variant="outline" onClick={fetchTickets}>Try Again</Button>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="empty-state">
            <img src="https://illustrations.popsy.co/amber/student-going-to-school.svg" alt="No tickets" />
            <h3>No tickets found</h3>
            <p>You don't have any tickets matching this status.</p>
            <Button variant="primary" onClick={() => setFilter('ALL')}>View All Tickets</Button>
          </div>
        ) : (
          <div className="tickets-grid">
            {filteredTickets.map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TicketDashboard;
