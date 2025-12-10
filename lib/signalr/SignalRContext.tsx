import { createContext, useContext, ReactNode } from "react";
import { useSignalR } from "./useSignalR";
import { SignalRHubUrls } from "./signalRConfig";
import { UseSignalRReturn } from "./signaIR.type";

interface SignalRContextType {
    chatHub: UseSignalRReturn;
    notificationHub: UseSignalRReturn;
}

const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

interface SignalRProviderProps {
    children: ReactNode;
    enabled?: boolean;
}

export function SignalRProvider({ children, enabled = true }: SignalRProviderProps) {
    const chatHub = useSignalR({
        hubPath: SignalRHubUrls.CHAT,
        enabled,
    });

    const notificationHub = useSignalR({
        hubPath: SignalRHubUrls.NOTIFICATION,
        enabled,
    });

    return (
        <SignalRContext.Provider value={{ chatHub, notificationHub }}>
            {children}
        </SignalRContext.Provider>
    );
}

export function useSignalRContext(): SignalRContextType {
    const context = useContext(SignalRContext);
    if (!context) {
        throw new Error("useSignalRContext must be used within SignalRProvider");
    }
    return context;
}

