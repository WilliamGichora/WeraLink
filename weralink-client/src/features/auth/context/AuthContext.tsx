import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/auth.service';

export type UserRole = 'WORKER' | 'EMPLOYER' | 'ADMIN';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    status: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<any>;
    register: (data: any) => Promise<void>;
    verifyOTP: (email: string, token: string, type?: 'signup' | 'magiclink' | 'recovery', rememberMe?: boolean) => Promise<void>;
    resendOTP: (email: string, type?: 'signup' | 'magiclink' | 'recovery') => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    updatePassword: (newPassword: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const checkAuth = async () => {
        try {
            const userData = await authService.checkAuth();
            setUser(userData);
        } catch (error) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        return await authService.login(email, password);
    };

    const register = async (data: any) => {
        await authService.register(data);
    };

    const verifyOTP = async (email: string, token: string, type: 'signup' | 'magiclink' | 'recovery' = 'signup', rememberMe: boolean = true) => {
        const userData = await authService.verifyOTP(email, token, type, rememberMe);
        if (userData) {
            setUser(userData);
        }
    };

    const resendOTP = async (email: string, type: 'signup' | 'magiclink' | 'recovery' = 'signup') => {
        await authService.resendOTP(email, type);
    };

    const forgotPassword = async (email: string) => {
        await authService.forgotPassword(email);
    };

    const updatePassword = async (newPassword: string) => {
        await authService.updatePassword(newPassword);
    };

    const logout = async () => {
        try {
            await authService.logout();
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            register,
            verifyOTP,
            resendOTP,
            forgotPassword,
            updatePassword,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
