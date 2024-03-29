import { keyframes } from 'goober';
import { Toast } from '../core/types';
import { ErrorIcon, ErrorTheme } from './error';
import { WarningIcon, WarningTheme } from "./warning";
import { LoaderIcon, LoaderTheme } from './loader';
import { CheckmarkIcon, CheckmarkTheme } from './checkmark';
import { CSSProperties, PropType, computed, defineComponent } from 'vue';
const StatusWrapper = defineComponent({
  name: "StatusWrapper",
  setup(_props, { slots }) {
    return () => <div style={{ position: "absolute" } as CSSProperties}>
      {
        slots.default()
      }
    </div>
  }
})

const IndicatorWrapper = defineComponent({
  name: "IndicatorWrapper",
  setup(_props, { slots }) {
    return () => (<div style={{
      position: "relative",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minWidth: "20px",
      minHeight: "20px"
    }}>
      {
        slots.default()
      }
    </div>)
  }
})

const enter = keyframes`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`;

export const AnimatedIconWrapper = defineComponent({
  name: "AnimatedIconWrapper",
  setup(_props, { slots }) {
    return () => <div style={
      {
        position: "relative",
        transform: "scale(0.6)",
        opacity: " 0.4",
        minWidth: " 20px",
        animation: `${enter} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards`
      }
    }>
      {
        slots.default()
      }
    </div>
  }
})

export type IconThemes = Partial<{
  success: CheckmarkTheme;
  error: ErrorTheme;
  warning: WarningTheme,
  loading: LoaderTheme;
}>;

export const ToastIcon = defineComponent({
  name: "ToastIcon",
  props: {
    toast: Object as PropType<Toast>
  },
  setup(props) {
    const type = computed(() => props.toast.type)
    const iconTheme = computed(() => props.toast.iconTheme)
    const icon = computed(() => props.toast.icon)

    const iconNode = computed(() => {
      switch (type.value) {
        case 'success':
          return <CheckmarkIcon {...iconTheme.value} />
        case 'error':
          return <ErrorIcon {...iconTheme.value} />
        case 'warning':
          return <WarningIcon {...iconTheme.value} />
        default:
          return null
      }
    })

    return () => {
      if (icon.value !== undefined) {
        if (typeof icon.value === 'string') {
          return <AnimatedIconWrapper>{icon.value}</AnimatedIconWrapper>;
        } else {
          return icon.value;
        }
      }
      if (type.value === 'blank') {
        return null;
      }
      return <IndicatorWrapper>
        <LoaderIcon {...iconTheme.value} />
        {
          type.value !== 'loading' && (
            <StatusWrapper>
              {iconNode.value}
            </StatusWrapper>)
        }
      </IndicatorWrapper>
    }
  }
})

