import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { BaseState } from '@/models/generic/baseState';
import { Router } from 'expo-router';
import { useMemo } from 'react';


export type NavigationCallback = (route: string) => void;

export abstract class BaseViewModel<T extends BaseState> {
    protected router?: Router;
    protected dispatch: ReturnType<typeof useAppDispatch>;
    protected getCurrentState: () => T;
    protected navigationCallback?: NavigationCallback;

    constructor(dispatch: ReturnType<typeof useAppDispatch>, getCurrentState: () => T) {
        this.dispatch = dispatch;
        this.getCurrentState = getCurrentState;
    }

    setNavigationCallback(callback: NavigationCallback): void {
        this.navigationCallback = callback;
    }

      setRouter(router: Router): void {
    this.router = router;
     }
    protected navigate(route: string): void {
         if (this.router) {
      this.router.replace(route as any);
    } else if (this.navigationCallback) {
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
            if (actions) {
                this.dispatch(actions.setLoading(true));
                this.dispatch(actions.setError(null));
            }

            const result = await operation();

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

export function useViewModel<T extends BaseState, VM extends BaseViewModel<T>>(
    ViewModelClass: new (dispatch: ReturnType<typeof useAppDispatch>, getCurrentState: () => T) => VM,
    selector: (state: any) => T
): [T, VM] {
    const dispatch = useAppDispatch();
    const state = useAppSelector(selector);

    const getCurrentState = () => state;
    const viewModel = useMemo(() =>
        new ViewModelClass(dispatch, getCurrentState),
        [dispatch, state]
    );

    return [state, viewModel];
} 