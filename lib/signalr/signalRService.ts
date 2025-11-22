import * as signalR from "@microsoft/signalr";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface SignalRConnectionOptions {
    hubUrl: string;
    accessToken?: string;
    onConnected?: () => void;
    onDisconnected?: (error?: Error) => void;
    onReconnecting?: (error?: Error) => void;
    onReconnected?: (connectionId?: string) => void;
}

class SignalRService {
    private connection: signalR.HubConnection | null = null;
    private options: SignalRConnectionOptions | null = null;
    private isConnecting = false;

    /**
     * Tạo kết nối đến SignalR Hub
     */
    async createConnection(options: SignalRConnectionOptions): Promise<void> {
        if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
            console.log("✅ SignalR đã được kết nối");
            return;
        }

        if (this.isConnecting) {
            console.log("⏳ Đang kết nối SignalR...");
            return;
        }

        this.options = options;
        this.isConnecting = true;

        try {
            // Tạo connection builder
            const connectionBuilder = new signalR.HubConnectionBuilder()
                .withUrl(options.hubUrl, {
                    accessTokenFactory: async () => {
                        // Refresh token nếu cần
                        const currentToken = await AsyncStorage.getItem(
                            process.env.EXPO_PUBLIC_STORAGE_TOKEN || "@token"
                        );
                        return currentToken ?? "";
                    },
                    skipNegotiation: false, // SignalR sẽ tự động negotiate
                    transport: signalR.HttpTransportType.WebSockets, // Chỉ dùng WebSocket
                })
                .withAutomaticReconnect({
                    nextRetryDelayInMilliseconds: (retryContext) => {
                        // Exponential backoff: 0s, 2s, 10s, 30s, sau đó mỗi 30s
                        if (retryContext.previousRetryCount === 0) return 0;
                        if (retryContext.previousRetryCount === 1) return 2000;
                        if (retryContext.previousRetryCount === 2) return 10000;
                        return 30000;
                    },
                })
                .configureLogging(signalR.LogLevel.Information);

            // Tạo connection
            this.connection = connectionBuilder.build();

            // Đăng ký các event handlers
            this.setupEventHandlers();

            // Bắt đầu kết nối
            await this.connection.start();
            console.log("✅ SignalR đã kết nối thành công");
            this.isConnecting = false;

            if (options.onConnected) {
                options.onConnected();
            }
        } catch (error) {
            console.error("❌ Lỗi kết nối SignalR:", error);
            this.isConnecting = false;
            throw error;
        }
    }

    /**
     * Thiết lập các event handlers
     */
    private setupEventHandlers(): void {
        if (!this.connection || !this.options) return;

        // Khi mất kết nối
        this.connection.onclose((error) => {
            console.log("🔌 SignalR đã ngắt kết nối", error);
            if (this.options?.onDisconnected) {
                this.options.onDisconnected(error || undefined);
            }
        });

        // Khi đang reconnect
        this.connection.onreconnecting((error) => {
            console.log("🔄 SignalR đang kết nối lại...", error);
            if (this.options?.onReconnecting) {
                this.options.onReconnecting(error || undefined);
            }
        });

        // Khi reconnect thành công
        this.connection.onreconnected((connectionId) => {
            console.log("✅ SignalR đã kết nối lại thành công", connectionId);
            if (this.options?.onReconnected) {
                this.options.onReconnected(connectionId);
            }
        });
    }

    /**
     * Đăng ký listener cho một method từ server
     */
    on(methodName: string, callback: (...args: any[]) => void): void {
        if (!this.connection) {
            console.warn("⚠️ SignalR chưa được kết nối. Không thể đăng ký listener.");
            return;
        }

        this.connection.on(methodName, callback);
        console.log(`👂 Đã đăng ký listener cho method: ${methodName}`);
    }

    /**
     * Gỡ bỏ listener cho một method
     */
    off(methodName: string, callback?: (...args: any[]) => void): void {
        if (!this.connection) {
            return;
        }

        if (callback) {
            this.connection.off(methodName, callback);
        } else {
            this.connection.off(methodName);
        }
        console.log(`🔇 Đã gỡ bỏ listener cho method: ${methodName}`);
    }

    /**
     * Gọi method trên server (invoke)
     */
    async invoke(methodName: string, ...args: any[]): Promise<any> {
        if (!this.connection) {
            throw new Error("SignalR chưa được kết nối");
        }

        if (this.connection.state !== signalR.HubConnectionState.Connected) {
            throw new Error("SignalR chưa sẵn sàng. Trạng thái: " + this.connection.state);
        }

        try {
            const result = await this.connection.invoke(methodName, ...args);
            return result;
        } catch (error) {
            console.error(`❌ Lỗi khi gọi method ${methodName}:`, error);
            throw error;
        }
    }

    /**
     * Gọi method trên server (send - không đợi response)
     */
    send(methodName: string, ...args: any[]): void {
        if (!this.connection) {
            throw new Error("SignalR chưa được kết nối");
        }

        if (this.connection.state !== signalR.HubConnectionState.Connected) {
            throw new Error("SignalR chưa sẵn sàng. Trạng thái: " + this.connection.state);
        }

        this.connection.send(methodName, ...args);
    }

    /**
     * Ngắt kết nối
     */
    async disconnect(): Promise<void> {
        if (this.connection) {
            try {
                await this.connection.stop();
                console.log("🔌 Đã ngắt kết nối SignalR");
            } catch (error) {
                console.error("❌ Lỗi khi ngắt kết nối SignalR:", error);
            } finally {
                this.connection = null;
                this.options = null;
                this.isConnecting = false;
            }
        }
    }

    /**
     * Kiểm tra trạng thái kết nối
     */
    getConnectionState(): signalR.HubConnectionState | null {
        return this.connection?.state ?? null;
    }

    /**
     * Kiểm tra đã kết nối chưa
     */
    isConnected(): boolean {
        return this.connection?.state === signalR.HubConnectionState.Connected;
    }

    /**
     * Lấy connection ID
     */
    getConnectionId(): string | null {
        return this.connection?.connectionId ?? null;
    }
}

// Export singleton instance
export const signalRService = new SignalRService();
export default signalRService;

