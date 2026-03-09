import React, { useState, useEffect } from 'react';
import { checkBackendHealth } from '../api/backendHealth';

const MLSyncStatus: React.FC = () => {
  const [synced, setSynced] = useState<boolean | null>(null);

  const checkStatus = async () => {
    try {
      console.log("Running ML health check...");
      const isSynced = await checkBackendHealth();
      console.log("Health check result:", isSynced);
      setSynced(isSynced);
    } catch (err) {
      console.error("Health check execution failed:", err);
      setSynced(false);
    }
  };

  useEffect(() => {
    // Run immediately
    checkStatus();

    // Continue polling
    const interval = setInterval(checkStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  if (synced === null) {
    return (
      <span className="text-slate-500 flex items-center gap-2">
        <i className="fa-solid fa-spinner fa-spin"></i> Initializing ML Sync...
      </span>
    );
  }

  return (
    <span className={`${synced ? 'text-green-500' : 'text-red-500'} flex items-center gap-2`}>
      <i className={`fa-solid ${synced ? 'fa-circle-check' : 'fa-circle-xmark'}`}></i>
      ML Model {synced ? 'Synchronized' : 'Desynchronized'}
    </span>
  );
};

export default MLSyncStatus;
