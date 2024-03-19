import { ComputedRef, Ref, computed, reactive, ref, toRefs, toValue, watch } from "vue";
import { DefaultToastOptions, Toast, ToastType } from "./types";
const TOAST_LIMIT = 20;
export const TOAST_EXPIRE_DISMISS_DELAY = 1000;
export enum ActionType {
  ADD_TOAST,
  UPDATE_TOAST,
  UPSERT_TOAST,
  DISMISS_TOAST,
  REMOVE_TOAST,
  START_PAUSE,
  END_PAUSE,
}

type Action =
  | {
    type: ActionType.ADD_TOAST;
    toast: Toast;
  }
  | {
    type: ActionType.UPSERT_TOAST;
    toast: Toast;
  }
  | {
    type: ActionType.UPDATE_TOAST;
    toast: Partial<Toast>;
  }
  | {
    type: ActionType.DISMISS_TOAST;
    toastId?: string;
  }
  | {
    type: ActionType.REMOVE_TOAST;
    toastId?: string;
  }
  | {
    type: ActionType.START_PAUSE;
    time: number;
  }
  | {
    type: ActionType.END_PAUSE;
    time: number;
  };

interface State {
  toasts: Toast[];
  pausedAt: number | undefined;
}

const listeners: Array<(state: State) => void> = [];
let memoryState: Ref<State> = ref({ toasts: ref([]) as any, pausedAt: undefined });
const toastTimeouts = new Map<Toast['id'], ReturnType<typeof setTimeout>>();
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: ActionType.REMOVE_TOAST,
      toastId: toastId,
    });
  }, TOAST_EXPIRE_DISMISS_DELAY);

  toastTimeouts.set(toastId, timeout);
};

const clearFromRemoveQueue = (toastId: string) => {
  const timeout = toastTimeouts.get(toastId);

  if (timeout) {
    clearTimeout(timeout);
  }
};

export const dispatch = (action: Action) => {
  memoryState.value = reducer(memoryState.value, action);
  listeners.forEach((listener) => {
    listener(memoryState.value);
  });
}
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionType.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case ActionType.UPDATE_TOAST:
      //  ! Side effects !
      if (action.toast.id) {
        clearFromRemoveQueue(action.toast.id);
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case ActionType.UPSERT_TOAST:
      const { toast } = action;
      return state.toasts.find((t) => t.id === toast.id)
        ? reducer(state, { type: ActionType.UPDATE_TOAST, toast })
        : reducer(state, { type: ActionType.ADD_TOAST, toast });

    case ActionType.DISMISS_TOAST:
      const { toastId } = action;

      // ! Side effects ! - This could be execrated into a dismissToast() action, but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
              ...t,
              visible: false,
            }
            : t
        ),
      };
    case ActionType.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };

    case ActionType.START_PAUSE:
      return {
        ...state,
        pausedAt: action.time,
        toasts: state.toasts.map((t) => ({
          ...t,
          paused: true,
        })),
      };

    case ActionType.END_PAUSE:
      const diff = action.time - (state.pausedAt || 0);
      return {
        ...state,
        pausedAt: undefined,
        toasts: state.toasts.map((t) => ({
          ...t,
          paused: false,
          pauseDuration: t.pauseDuration + diff,
        })),
      };
  }
};


export const defaultTimeouts: {
  [key in ToastType]: number;
} = {
  blank: 4000,
  error: 4000,
  success: 2000,
  loading: Infinity,
  custom: 4000,
};

export const useStore = (toastOptions: DefaultToastOptions = {}): {
  toasts: ComputedRef<Toast[]>,
  pausedAt?: Ref<number>
} => {
  const state = reactive<State>(toValue(memoryState))
  const setState = (v: State) => {
    state.pausedAt = toValue(v.pausedAt)
    state.toasts = toValue(v.toasts)
  }
  watch(memoryState, setState)
  watch(state, () => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  });

  const mergedToasts = computed(() => state.toasts.map((t) => ({
    ...toastOptions,
    ...toastOptions[t.type],
    ...t,
    duration:
      t.duration ||
      toastOptions[t.type]?.duration ||
      toastOptions?.duration ||
      defaultTimeouts[t.type],
    style: {
      ...toastOptions.style,
      ...toastOptions[t.type]?.style,
      ...t.style,
    },
  })));

  return {
    ...toRefs(state),
    toasts: mergedToasts,
  };
};
