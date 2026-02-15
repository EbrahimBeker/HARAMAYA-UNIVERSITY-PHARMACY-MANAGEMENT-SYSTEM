import { useState, useEffect } from 'react';
import api from '../services/api';

export const useConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [lastChecked, setLastChecked] = useState(new Date());

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await api.get('/auth/me');
        setIsConnected(true);
      } catch (error) {
        if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
          setIsConnected(false);
        }
      }
      setLastChecked(new Date());
    };

    // Check immediately
    checkConnection();

    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  return { isConnected, lastChecked };
};