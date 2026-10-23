import React, { useState } from 'react';
import { History, Search, ShieldCheck, Filter, UserCheck, Clock } from 'lucide-react';
import { AppStore } from '../services/store';
import { AuditLogItem } from '../types';

export const AuditLogPage: React.FC = () => {
  const [logs] = useState<AuditLogItem[]>(AppStore.getAuditLogs());
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');

  const filteredLogs = logs.filter(l => {
    const matchSearch = l.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchModule = moduleFilter ? l.module === moduleFilter : true;
    return matchSearch && matchModule;
  });

  const modules = Array.from(new Set(logs.map(l => l.module)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0 }}>System Audit Trail & Security Logs</h1>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
          Immutable record of pay calculations, DDO sanctions, service book modifications, and commission changes
        </p>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
            <input
              type="text"
              placeholder="Search audit trail by actor, action or order..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '2.4rem' }}
            />
          </div>

          <div style={{ width: '220px' }}>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="form-select"
            >
              <option value="">All Functional Modules</option>
              {modules.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="data-table-wrapper" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor / Role</th>
                <th>Action Code</th>
                <th>Module</th>
                <th>Event Description & Audit Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(l => (
                <tr key={l.id}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={14} />
                      {l.timestamp}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-neutral" style={{ fontWeight: 700 }}>
                      <UserCheck size={12} /> {l.username}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      backgroundColor: '#eff6ff',
                      color: '#1e40af',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace'
                    }}>
                      {l.action}
                    </span>
                  </td>
                  <td>
                    <strong>{l.module}</strong>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.45 }}>
                    {l.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
