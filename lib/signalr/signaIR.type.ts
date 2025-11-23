import * as signalR from "@microsoft/signalr";

export interface UseSignalROptions {
    hubPath: string;
    enabled?: boolean;
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




