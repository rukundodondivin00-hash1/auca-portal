import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';

interface NotificationMessage {
  type: 'REMINDER_1_WEEK' | 'REMINDER_3_DAYS' | 'PENALTY_APPLIED' | 'GENERAL';
  title?: string;
  message: string;
  installmentId?: string;
  amount?: number;
}

export function useWebsocketNotifications(studentId: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!studentId) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    // Use environment variable or fallback to the render URL
    const wsUrl = import.meta.env.VITE_WS_URL || 'wss://auca-ims.onrender.com/ws/notifications';
    
    // We pass studentId as a query param or headers depending on standard websocket support.
    // Standard websockets don't support custom headers easily in browser, so query param is common.
    const urlWithParams = `${wsUrl}?studentId=${encodeURIComponent(studentId)}`;

    const connect = () => {
      console.log(`Attempting to connect WebSocket for student ${studentId}...`);
      const ws = new WebSocket(urlWithParams);

      ws.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        // Optional: send a message to subscribe to specific topics if the server expects it
        // ws.send(JSON.stringify({ action: 'subscribe', topic: `/user/${studentId}/queue/notifications` }));
      };

      ws.onmessage = (event) => {
        try {
          const data: NotificationMessage = JSON.parse(event.data);
          
          let toastType: 'info' | 'warning' | 'error' | 'success' = 'info';
          let title = data.title || 'New Notification';

          switch (data.type) {
            case 'REMINDER_1_WEEK':
              toastType = 'info';
              title = data.title || 'Upcoming Installment Deadline (1 Week)';
              break;
            case 'REMINDER_3_DAYS':
              toastType = 'warning';
              title = data.title || 'Urgent: Installment Deadline in 3 Days';
              break;
            case 'PENALTY_APPLIED':
              toastType = 'error';
              title = data.title || 'Penalty Applied';
              break;
            default:
              toastType = 'info';
          }

          toast[toastType](title, {
            description: data.message,
            duration: data.type === 'PENALTY_APPLIED' ? 10000 : 8000, // Longer duration for penalties
          });

        } catch (err) {
          console.error('Failed to parse WebSocket message', event.data);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected', event.reason);
        setIsConnected(false);
        // Reconnect logic
        setTimeout(() => {
          if (studentId) {
            connect();
          }
        }, 5000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        ws.close();
      };

      wsRef.current = ws;
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [studentId]);

  return { isConnected };
}
