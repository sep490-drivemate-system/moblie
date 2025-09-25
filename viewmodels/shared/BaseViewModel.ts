import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { BaseState } from '@/models/generic/baseState';
import { useMemo } from 'react';

// Navigation callback type
export type NavigationCallback = (route: string) => void;

export abstract class BaseViewModel<T extends BaseState> {
    protected dispatch: ReturnType<typeof useAppDispatch>;
    protected getCurrentState: () => T;
    protected navigationCallback?: NavigationCallback;

    constructor(dispatch: ReturnType<typeof useAppDispatch>, getCurrentState: () => T) {
        this.dispatch = dispatch;
        this.getCurrentState = getCurrentState;
    }

    // Set navigation callback để ViewModel có thể điều hướng
    setNavigationCallback(callback: NavigationCallback): void {
        this.navigationCallback = callback;
    }

    // Protected method để subclass có thể navigate
    protected navigate(route: string): void {
        if (this.navigationCallback) {
            this.navigationCallback(route);
        }
    }

    protected async executeAsync<TResult>(
        operation: () => Promise<TResult>,
        onSuccess?: (result: TResult) => void,
        onError?: (error: string) => void,
        actions?: {
            setLoading: (loading: boolean) => any;
            setError: (error: string | null) => any;
            setSuccess: (success: boolean) => any;
        }
    ): Promise<TResult | null> {
        try {
            // Dispatch loading action using provided actions
            if (actions) {
                this.dispatch(actions.setLoading(true));
                this.dispatch(actions.setError(null));
            }

            const result = await operation();

            // Dispatch success action
            if (actions) {
                this.dispatch(actions.setSuccess(true));
            }
            onSuccess?.(result);

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An error occurred';
            if (actions) {
                this.dispatch(actions.setError(errorMessage));
            }
            onError?.(errorMessage);
            return null;
        } finally {
            if (actions) {
                this.dispatch(actions.setLoading(false));
            }
        }
    }
}

// Hook để sử dụng ViewModel với Redux
export function useViewModel<T extends BaseState, VM extends BaseViewModel<T>>(
    ViewModelClass: new (dispatch: ReturnType<typeof useAppDispatch>, getCurrentState: () => T) => VM,
    selector: (state: any) => T
): [T, VM] {
    const dispatch = useAppDispatch();
    const state = useAppSelector(selector);

    // Tạo getCurrentState function để ViewModel có thể lấy state hiện tại
    const getCurrentState = () => state;

    // Sử dụng useMemo để tránh tạo instance mới mỗi render
    const viewModel = useMemo(() =>
        new ViewModelClass(dispatch, getCurrentState),
        [dispatch, state]
    );

    return [state, viewModel];
} 