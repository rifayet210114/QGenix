// ============================================================
// ProfileContext.jsx — QGenix Global Student Profile Store
// ------------------------------------------------------------
// Provides a shared React Context for the user's profile
// data (name + avatar) so that any component in the tree —
// including the Navbar — can read and update the same values
// without prop-drilling through the layout hierarchy.
// ============================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Default profiles for each role
const defaultProfiles = {
  Student: { firstName: 'Rafayel', lastName: 'Ahmed', avatarUrl: null },
  Teacher: { firstName: 'Dr. Sarah', lastName: 'Ahmed', avatarUrl: null },
  Admin: { firstName: 'System', lastName: 'Admin', avatarUrl: null },
};

// Create the context
const ProfileContext = createContext({
  profile: defaultProfiles.Student,
  setProfile: () => {},
});

// Provider — wraps the entire app so all children can access profile data
export function ProfileProvider({ children }) {
  const location = useLocation();

  // Store all role profiles in a single state object
  const [profiles, setProfiles] = useState(() => {
    try {
      const saved = localStorage.getItem('qgenix_profiles_by_role');
      return saved ? JSON.parse(saved) : defaultProfiles;
    } catch (e) {
      return defaultProfiles;
    }
  });

  useEffect(() => {
    localStorage.setItem('qgenix_profiles_by_role', JSON.stringify(profiles));
  }, [profiles]);

  // Determine current active role from URL pathname
  const getRoleFromPath = () => {
    const path = location.pathname;
    if (path.includes('/teacher')) return 'Teacher';
    if (path.includes('/admin')) return 'Admin';
    return 'Student'; // Default fallback
  };

  const currentRole = getRoleFromPath();
  const activeProfile = profiles[currentRole] || defaultProfiles[currentRole];

  const updateProfile = (newProfileVal) => {
    setProfiles(prev => {
      const currentProfile = prev[currentRole] || defaultProfiles[currentRole];
      const updatedProfile = typeof newProfileVal === 'function'
        ? newProfileVal(currentProfile)
        : newProfileVal;

      return {
        ...prev,
        [currentRole]: updatedProfile
      };
    });
  };

  return (
    <ProfileContext.Provider value={{ profile: activeProfile, setProfile: updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

// Convenience hook so consumers don't import useContext + ProfileContext manually
export function useProfile() {
  return useContext(ProfileContext);
}
