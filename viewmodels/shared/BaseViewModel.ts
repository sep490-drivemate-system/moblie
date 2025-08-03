import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { BaseState } from '@/models/generic/baseState';

export abstract class BaseViewModel<T extends BaseState> {
    protected dispatch: ReturnType<typeof useAppDispatch>;
    protected selector: (state: any) => T;

    constructor(dispatch: ReturnType<typeof useAppDispatch>, selector: (state: any) => T) {
        this.dispatch = dispatch;
        this.selector = selector;
    }

    protected getState(state: any): T {
        return this.selector(state);
    }

    protected async executeAsync<TResult>(
        operation: () => Promise<TResult>,
        onSuccess?: (result: TResult) => void,
        onError?: (error: string) => void
    ): Promise<TResult | null> {
        try {
            // Dispatch loading action
            this.dispatch({ type: 'SET_LOADING', payload: true });
            this.dispatch({ type: 'SET_ERROR', payload: null });

            const result = await operation();

            // Dispatch success action
            this.dispatch({ type: 'SET_SUCCESS', payload: true });
            onSuccess?.(result);

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An error occurred';
            this.dispatch({ type: 'SET_ERROR', payload: errorMessage });
            onError?.(errorMessage);
            return null;
        } finally {
            this.dispatch({ type: 'SET_LOADING', payload: false });
        }
    }
}

// Hook để sử dụng ViewModel với Redux
export function useViewModel<T extends BaseState, VM extends BaseViewModel<T>>(
    ViewModelClass: new (dispatch: ReturnType<typeof useAppDispatch>, selector: (state: any) => T) => VM,
    selector: (state: any) => T
): [T, VM] {
    const dispatch = useAppDispatch();
    const state = useAppSelector(selector);
    const viewModel = new ViewModelClass(dispatch, selector);

    return [state, viewModel];
} 