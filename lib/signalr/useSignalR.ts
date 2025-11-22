import { useEffect, useRef, useState, useCallback } from "react";
import { signalRService, SignalRConnectionOptions } from "./signalRService";
import * as signalR from "@microsoft/signalr";

export interface UseSignalROptions {
    hubUrl: string;
    accessToken?: string;
    enabled?: boolean; // Có tự động kết nối khi mount không
    onConnected?: () => void;
    onDisconnected?: (error?: Error) => void;
    onReconnecting?: (error?: Error) => void;
    onReconnected?: (connectionId?: string) => void;
}

export interface UseSignalRReturn {
    connection: signalR.HubConnection | null;
    isConnected: boolean;
    isConnecting: boolean;
    connectionState: signalR.HubConnectionState | null;
    connectionId: string | null;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    on: (methodName: string, callback: (...args: any[]) => void) => void;
    off: (methodName: string, callback?: (...args: any[]) => void) => void;
    invoke: (methodName: string, ...args: any[]) => Promise<any>;
    send: (methodName: string, ...args: any[]) => void;
}

/**
 * Hook để sử dụng SignalR trong React Native components
 * 
 * @example
 * ```tsx
 * const { isConnected, connect, on, invoke } = useSignalR({
 *   hubUrl: 'https://api.example.com/chatHub',
 *   enabled: true,
 * });
 * 
 * useEffect(() => {
 *   if (isConnected) {
 *     on('ReceiveMessage', (user, message) => {
 *       console.log('Nhận tin nhắn:', message);
 *     });
 *   }
 * }, [isConnected, on]);
 * 
 * const sendMessage = async () => {
 *   await invoke('SendMessage', userId, message);
 * };
 * ```
 */
export function useSignalR(options: UseSignalROptions): UseSignalRReturn {
    const {
        hubUrl,
        accessToken,
        enabled = true,
        onConnected,
        onDisconnected,
        onReconnecting,
        onReconnected,
    } = options;

    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionState, setConnectionState] = useState<signalR.HubConnectionState | null>(null);
    const [connectionId, setConnectionId] = useState<string | null>(null);

    const optionsRef = useRef(options);
    const listenersRef = useRef<Map<string, (...args: any[]) => void>>(new Map());

    // Cập nhật options ref khi options thay đổi
    useEffect(() => {
        optionsRef.current = options;
    }, [options]);

    // Hàm kết nối
    const connect = useCallback(async () => {
        if (isConnecting || isConnected) {
            return;
        }

        setIsConnecting(true);
        try {
            await signalRService.createConnection({
                hubUrl,
                accessToken,
                onConnected: () => {
                    setIsConnected(true);
                    setIsConnecting(false);
                    setConnectionState(signalRService.getConnectionState());
                    setConnectionId(signalRService.getConnectionId());
                    onConnected?.();
                },
                onDisconnected: (error) => {
                    setIsConnected(false);
                    setIsConnecting(false);
                    setConnectionState(signalRService.getConnectionState());
                    setConnectionId(null);
                    onDisconnected?.(error);
                },
                onReconnecting: (error) => {
                    setIsConnected(false);
                    setConnectionState(signalRService.getConnectionState());
                    onReconnecting?.(error);
                },
                onReconnected: (connectionId) => {
                    setIsConnected(true);
                    setConnectionState(signalRService.getConnectionState());
                    setConnectionId(connectionId ?? null);
                    onReconnected?.(connectionId);
                },
            });
        } catch (error) {
            setIsConnecting(false);
            setIsConnected(false);
            console.error("Lỗi kết nối SignalR:", error);
        }
    }, [hubUrl, accessToken, isConnecting, isConnected, onConnected, onDisconnected, onReconnecting, onReconnected]);

    // Hàm ngắt kết nối
    const disconnect = useCallback(async () => {
        // Gỡ tất cả listeners
        listenersRef.current.forEach((callback, methodName) => {
            signalRService.off(methodName, callback);
        });
        listenersRef.current.clear();

        await signalRService.disconnect();
        setIsConnected(false);
        setIsConnecting(false);
        setConnectionState(null);
        setConnectionId(null);
    }, []);

    // Hàm đăng ký listener
    const on = useCallback((methodName: string, callback: (...args: any[]) => void) => {
        signalRService.on(methodName, callback);
        listenersRef.current.set(methodName, callback);
    }, []);

    // Hàm gỡ listener
    const off = useCallback((methodName: string, callback?: (...args: any[]) => void) => {
        if (callback) {
            signalRService.off(methodName, callback);
            listenersRef.current.delete(methodName);
        } else {
            signalRService.off(methodName);
            listenersRef.current.delete(methodName);
        }
    }, []);

    // Hàm invoke
    const invoke = useCallback(async (methodName: string, ...args: any[]) => {
        return await signalRService.invoke(methodName, ...args);
    }, []);

    // Hàm send
    const send = useCallback((methodName: string, ...args: any[]) => {
        signalRService.send(methodName, ...args);
    }, []);

    // Tự động kết nối khi mount nếu enabled = true
    useEffect(() => {
        if (enabled) {
            connect();
        }

        // Cleanup: ngắt kết nối khi unmount
        return () => {
            disconnect();
        };
    }, [enabled]); // Chỉ chạy khi enabled thay đổi

    // Cập nhật connection state định kỳ
    useEffect(() => {
        if (!enabled) return;

        const interval = setInterval(() => {
            const state = signalRService.getConnectionState();
            const connected = signalRService.isConnected();
            const id = signalRService.getConnectionId();

            setConnectionState(state);
            setIsConnected(connected);
            setConnectionId(id);
        }, 1000);

        return () => clearInterval(interval);
    }, [enabled]);

    return {
        connection: null, // Không expose connection trực tiếp để tránh misuse
        isConnected,
        isConnecting,
        connectionState,
        connectionId,
        connect,
        disconnect,
        on,
        off,
        invoke,
        send,
    };
}

