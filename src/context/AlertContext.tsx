import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PriceAlert } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from './AuthContext.tsx';

interface AlertContextType {
  alerts: PriceAlert[];
  isLoading: boolean;
  createAlert: (productId: string, targetPrice: number) => Promise<PriceAlert>;
  updateAlert: (alertId: string, data: { targetPrice?: number; isActive?: boolean }) => Promise<void>;
  deleteAlert: (alertId: string) => Promise<void>;
  getAlertForProduct: (productId: string) => PriceAlert | undefined;
  refreshAlerts: () => Promise<void>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshAlerts = useCallback(async () => {
    if (!user) {
      setAlerts([]);
      return;
    }
    try {
      setIsLoading(true);
      const res = await api.getAlerts();
      setAlerts(res.alerts || []);
    } catch (err) {
      console.warn('Error fetching alerts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshAlerts();
  }, [refreshAlerts]);

  const createAlert = async (productId: string, targetPrice: number): Promise<PriceAlert> => {
    if (!user) throw new Error('Please login to set price alerts');
    const res = await api.createAlert(productId, targetPrice);
    await refreshAlerts();
    return res.alert;
  };

  const updateAlert = async (alertId: string, data: { targetPrice?: number; isActive?: boolean }) => {
    if (!user) return;
    await api.updateAlert(alertId, data);
    await refreshAlerts();
  };

  const deleteAlert = async (alertId: string) => {
    if (!user) return;
    await api.deleteAlert(alertId);
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const getAlertForProduct = (productId: string) => {
    return alerts.find((a) => a.productId === productId);
  };

  return (
    <AlertContext.Provider
      value={{
        alerts,
        isLoading,
        createAlert,
        updateAlert,
        deleteAlert,
        getAlertForProduct,
        refreshAlerts,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export function useAlerts() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
}
