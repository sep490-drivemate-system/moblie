// Environment configuration
export const ENV = {
    API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
    API_TIMEOUT: 30000, // 30 seconds

    // Development flags
    IS_DEV: __DEV__,
    ENABLE_LOGGING: __DEV__,

    // App configuration
    APP_NAME: 'Mobile App',
    VERSION: '1.0.0',

    // Storage keys
    STORAGE_KEYS: {
        ACCESS_TOKEN: 'access_token',
        REFRESH_TOKEN: 'refresh_token',
        USER_DATA: 'user_data',
    },

    // Authentication
    TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
} as const;

// Type-safe environment validation
export function validateEnvironment() {
    const requiredEnvVars = ['EXPO_PUBLIC_API_URL'];

    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            console.warn(`Environment variable ${envVar} is not set. Using default value.`);
        }
    }
}

// Call validation on import
if (ENV.IS_DEV) {
    validateEnvironment();
}
