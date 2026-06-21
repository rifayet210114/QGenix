import React from 'react';
import Card from '../../components/Card';
// Lucide icons for actions including imports, addition and user searching
import { Upload, Plus, Search } from 'lucide-react';

/**
 * UserManagement Component
 * 
 * Provides QGenix administrators with interface tools to manage the user database.
 * Displays a directory table containing user roles, status, and edit controls.
 * Supports quick search and actions like CSV bulk importing or single user addition.
 */
export default function UserManagement() {
  return (
    <div className="flex-col gap-6" style={{ display: 'flex' }}>
      {/* ======= CONTROLS AND ACTION HEADER ======= */}
      {/* Contains search filter inputs and action buttons for managing users */}
      <div className="flex justify-between items-center">
        {/* Search Input field with search icon overlay */}
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input type="text" className="input-field" placeholder="Search users..." style={{ paddingLeft: '40px' }} />
        </div>
        {/* Bulk upload and manual addition buttons */}
        <div className="flex gap-4">
          <button className="btn btn-secondary"><Upload size={16} style={{ marginRight: '8px' }} /> Bulk CSV Upload</button>
          <button className="btn btn-primary"><Plus size={16} style={{ marginRight: '8px' }} /> Add User</button>
        </div>
      </div>
      
      {/* ======= USER DIRECTORY SECTION ======= */}
      {/* Card containing the main user list table with responsive scroll */}
      <Card title="User Directory">
        <div style={{ overflowX: 'auto', marginTop: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>Role</th>
                <th style={{ padding: '12px' }}>Email</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Iterates through a mock array of user items and displays their profile records */}
              {[
                { name: 'Alice Johnson', role: 'Teacher', email: 'alice@qgenix.ai', status: 'Active' },
                { name: 'Bob Smith', role: 'Student', email: 'bob@student.edu', status: 'Active' },
                { name: 'Charlie Brown', role: 'Student', email: 'charlie@student.edu', status: 'Inactive' }
              ].map((u, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-color-light)' }}>
                  {/* User Profile Name */}
                  <td style={{ padding: '16px 12px' }}>{u.name}</td>
                  {/* User Role with dynamic badge color depending on role type */}
                  <td style={{ padding: '16px 12px' }}><span className={`badge ${u.role === 'Teacher' ? 'badge-primary' : 'badge-secondary'}`}>{u.role}</span></td>
                  {/* Secondary detail showing the email */}
                  <td style={{ padding: '16px 12px', color: 'var(--text-secondary)' }}>{u.email}</td>
                  {/* Active/Inactive state with responsive success or danger styling */}
                  <td style={{ padding: '16px 12px' }}><span className={`badge ${u.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>{u.status}</span></td>
                  {/* Controls for record modification */}
                  <td style={{ padding: '16px 12px' }}>
                    <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}