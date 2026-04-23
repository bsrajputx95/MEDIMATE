import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface RealtimeConfig {
  refetchInterval?: number;
  pauseOnBackground?: boolean;
  onUpdate?: (data: any) => void;
}

export function useRealtimeUpdates<T>(
  fetchFn: () => Promise<T>,
  config: RealtimeConfig = {}
) {
  const {
    refetchInterval = 30000, // 30 seconds default
    pauseOnBackground = true,
    onUpdate,
  } = config;

  const [data, setData] = useState<T | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    }

    try {
      const result = await fetchFn();
      setData(result);
      setLastUpdated(new Date());
      onUpdate?.(result);
    } catch (error) {
      console.error('Real-time update failed:', error);
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      }
    }
  }, [fetchFn, onUpdate]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      fetchData();
    }, refetchInterval);
  }, [fetchData, refetchInterval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (pauseOnBackground) {
        if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
          // App came to foreground
          fetchData();
          startPolling();
        } else if (nextAppState.match(/inactive|background/)) {
          // App went to background
          stopPolling();
        }
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [pauseOnBackground, fetchData, startPolling, stopPolling]);

  // Initial fetch and start polling
  useEffect(() => {
    fetchData();
    startPolling();

    return () => {
      stopPolling();
    };
  }, []);

  return {
    data,
    isRefreshing,
    lastUpdated,
    refresh,
    startPolling,
    stopPolling,
  };
}

// WebSocket-based real-time updates (for future use)
export function useWebSocketUpdates<T>(
  url: string,
  config: {
    onMessage?: (data: T) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    reconnectInterval?: number;
  } = {}
) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<T | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    onMessage,
    onConnect,
    onDisconnect,
    reconnectInterval = 5000,
  } = config;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        setIsConnected(true);
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          onMessage?.(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        onDisconnect?.();

        // Attempt to reconnect
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, reconnectInterval);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }, [url, onConnect, onDisconnect, onMessage, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    wsRef.current?.close();
    wsRef.current = null;
    setIsConnected(false);
  }, []);

  const send = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    send,
    connect,
    disconnect,
  };
}

// Server-Sent Events (SSE) based real-time updates
export function useSSEUpdates<T>(
  url: string,
  config: {
    onMessage?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<T | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const { onMessage, onError } = config;

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      return;
    }

    try {
      const eventSource = new EventSource(url);

      eventSource.onopen = () => {
        setIsConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastEvent(data);
          onMessage?.(data);
        } catch (error) {
          console.error('Failed to parse SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        setIsConnected(false);
        onError?.(new Error('SSE connection error'));
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error('Failed to connect SSE:', error);
    }
  }, [url, onMessage, onError]);

  const disconnect = useCallback(() => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    setIsConnected(false);
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    lastEvent,
    connect,
    disconnect,
  };
}

export default useRealtimeUpdates;
