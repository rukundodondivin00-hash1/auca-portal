import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { studentApi } from '@/lib/api';

interface DashboardContextType {
  data: any | null;
  loading: boolean;
  error: Error | null;
}

const DashboardContext = createContext<DashboardContextType>({
  data: null,
  loading: true,
  error: null,
});

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    studentApi.getDashboard()
      .then(res => {
        setData(res.data?.data || res.data);
      })
      .catch(err => {
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <DashboardContext.Provider value={{ data, loading, error }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  return useContext(DashboardContext);
}
