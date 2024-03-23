import { onUnmounted, shallowRef, watch } from 'vue';
import { dispatch, ActionType, useStore } from './store';
import { toast } from './toast';
import { DefaultToastOptions, Toast, ToastPosition } from './types';

const updateHeight = (toastId: string, height: number) => {
  dispatch({
    type: ActionType.UPDATE_TOAST,
    toast: { id: toastId, height },
  });
};
const startPause = () => {
  dispatch({
    type: ActionType.START_PAUSE,
    time: Date.now(),
  });
};

const clearLeaveTimeout = (timeouts: number[]) => {
  timeouts.forEach((timeout) => timeout && clearTimeout(timeout));
}
interface ExtraConfig {
  stacked: boolean
}
export const useToaster = (toastOptions?: DefaultToastOptions, extraConfig?: ExtraConfig) => {
  const { toasts, pausedAt } = useStore(toastOptions);
  let timeouts = shallowRef([])
  watch([toasts, pausedAt], () => {
    clearLeaveTimeout(timeouts.value)
    if (pausedAt.value) {
      return;
    }
    const now = Date.now();
    timeouts.value = toasts.value.map((t) => {
      if (t.duration === Infinity) {
        return;
      }

      const durationLeft =
        (t.duration || 0) + t.pauseDuration - (now - t.createdAt);

      if (durationLeft < 0) {
        if (t.visible) {
          toast.dismiss(t.id);
        }
        return;
      }
      return setTimeout(() => toast.dismiss(t.id), durationLeft);
    });
  });

  onUnmounted(() => {
    clearLeaveTimeout(timeouts.value)
  })

  const endPause = () => {
    if (pausedAt) {
      dispatch({ type: ActionType.END_PAUSE, time: Date.now() });
    }
  };

  const calculateOffset =
    (
      toast: Toast,
      opts?: {
        reverseOrder?: boolean;
        gutter?: number;
        defaultPosition?: ToastPosition;
      }
    ) => {
      const { reverseOrder = false, gutter = 8, defaultPosition } = opts || {};

      const relevantToasts = toasts.value.filter(
        (t) =>
          (t.position || defaultPosition) ===
          (toast.position || defaultPosition) && t.height
      );
      const toastIndex = relevantToasts.findIndex((t) => t.id === toast.id);
      const toastsBefore = relevantToasts.filter(
        (toast, i) => i < toastIndex && toast.visible
      ).length;

      const offset = relevantToasts
        .filter((t) => t.visible)
        .slice(...(reverseOrder ? [toastsBefore + 1] : [0, toastsBefore]))
        .reduce((acc, t) => acc + (t.height || 0) + gutter, 0);

      return offset;
    };

  return {
    toasts,
    handlers: {
      updateHeight,
      startPause,
      endPause,
      calculateOffset,
    },
  };
};
