import { useEffect, useRef, useState, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SignalRHubPaths, SignalRHubUrls } from "@/lib/signalr/signalRConfig";
import { UseSignalROptions, UseSignalRReturn } from "./signaIR.type";


export function useSignalR(options: UseSignalROptions): UseSignalRReturn {
    const {
        hubPath,
        enabled = true,
    } = options;

    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionState, setConnectionState] = useState<signalR.HubConnectionState | null>(null);
    const [connectionId, setConnectionId] = useState<string | null>(null);

    const connectionRef = useRef<signalR.HubConnection | null>(null);
    const listenersRef = useRef<Map<string, (...args: any[]) => void>>(new Map());
    const optionsRef = useRef(options);

    useEffect(() => {
        optionsRef.current = options;
    }, [options, hubPath]);



    const connect = useCallback(async () => {
        if (isConnecting || isConnected || connectionRef.current) {
            return;
        }

        setIsConnecting(true);
        try {
            const builder = new signalR.HubConnectionBuilder()
                .withUrl(hubPath, {
                    accessTokenFactory: async () => {
                        const token = await AsyncStorage.getItem(process.env.EXPO_PUBLIC_STORAGE_TOKEN || '@token');
                        return token ?? '';
                    },
                })
                .withAutomaticReconnect({
                    nextRetryDelayInMilliseconds: (retryContext) => {
                        if (retryContext.previousRetryCount < 3) {
                            return 1000;
                        }
                        if (retryContext.previousRetryCount < 10) {
                            return 5000;
                        }
                        return 30000;
                    },
                });

            const hubConnection = builder.build();

            hubConnection.onclose((error) => {
                setIsConnected(false);
                setIsConnecting(false);
                setConnectionState(hubConnection.state);
                setConnectionId(null);
                optionsRef.current.onDisconnected?.(error || undefined);
            });

            hubConnection.onreconnecting((error) => {
                setIsConnected(false);
                setConnectionState(hubConnection.state);
                optionsRef.current.onReconnecting?.(error || undefined);
            });

            hubConnection.onreconnected((connectionId) => {
                setIsConnected(true);
                setConnectionState(hubConnection.state);
                setConnectionId(connectionId ?? null);
                optionsRef.current.onReconnected?.(connectionId);
            });

            await hubConnection.start();

            setIsConnected(true);
            setIsConnecting(false);
            setConnectionState(hubConnection.state);
            setConnectionId(hubConnection.connectionId ?? null);
            setConnection(hubConnection);
            connectionRef.current = hubConnection;

            optionsRef.current.onConnected?.();
        } catch (error: any) {
            setIsConnecting(false);
            setIsConnected(false);
            setConnectionState(null);
            console.log("Lỗi kết nối SignalR:", error);
        }
    }, [isConnecting, isConnected]);

    const disconnect = useCallback(async () => {
        if (connectionRef.current) {
            listenersRef.current.forEach((callback, methodName) => {
                connectionRef.current?.off(methodName, callback);
            });
            listenersRef.current.clear();

            if (connectionRef.current.state !== signalR.HubConnectionState.Disconnected) {
                await connectionRef.current.stop();
            }

            connectionRef.current = null;
            setConnection(null);
        }

        setIsConnected(false);
        setIsConnecting(false);
        setConnectionState(null);
        setConnectionId(null);
    }, []);

    const on = useCallback((methodName: string, callback: (...args: any[]) => void) => {
        if (connectionRef.current) {
            connectionRef.current.on(methodName, callback);
            listenersRef.current.set(methodName, callback);
        }
    }, []);

    const off = useCallback((methodName: string, callback?: (...args: any[]) => void) => {
        if (connectionRef.current) {
            if (callback) {
                connectionRef.current.off(methodName, callback);
                listenersRef.current.delete(methodName);
            } else {
                connectionRef.current.off(methodName);
                listenersRef.current.delete(methodName);
            }
        }
    }, []);

    const invoke = useCallback(async (methodName: string, ...args: any[]) => {
        if (!connectionRef.current) {
            throw new Error("SignalR connection is not established");
        }
        return await connectionRef.current.invoke(methodName, ...args);
    }, []);

    const send = useCallback((methodName: string, ...args: any[]) => {
        if (connectionRef.current) {
            connectionRef.current.send(methodName, ...args);
        }
    }, []);

    useEffect(() => {
        if (enabled) {
            connect();
        }

        return () => {
            if (connectionRef.current) {
                disconnect();
            }
        };
    }, [enabled]);

    useEffect(() => {
        if (!enabled || !connectionRef.current) return;

        const updateState = () => {
            if (connectionRef.current) {
                const state = connectionRef.current.state;
                const connected = state === signalR.HubConnectionState.Connected;
                const id = connectionRef.current.connectionId;

                setConnectionState(state);
                setIsConnected(connected);
                setConnectionId(id ?? null);
            }
        };

        const interval = setInterval(updateState, 1000);
        return () => clearInterval(interval);
    }, [enabled]);

    return {
        connection,
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

