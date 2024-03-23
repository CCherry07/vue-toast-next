import { keyframes } from 'goober';

import { Toast, ToastPosition, resolveValue } from '../core/types';
import { ToastIcon } from './toast-icon.tsx';
import { prefersReducedMotion } from '../core/utils';
import { CSSProperties, PropType, computed, defineComponent } from 'vue';

const enterAnimation = (factor: number) => `
0% {transform: translate3d(0,${factor * -200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`;

const exitAnimation = (factor: number) => `
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${factor * -150}%,-1px) scale(.6); opacity:0;}
`;

const fadeInAnimation = `0%{opacity:0;} 100%{opacity:1;}`;
const fadeOutAnimation = `0%{opacity:1;} 100%{opacity:0;}`;

const ToastBarBase = defineComponent({
  name: "ToastBarBase",
  setup(_props, { slots }) {
    return () => <div style={{
      display: "flex",
      alignItems: "center",
      background: "#fff",
      color: "#363636",
      lineHeight: "1.3",
      willChange: "transform",
      boxShadow: "0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05)",
      maxWidth: "350px",
      pointerEvents: "auto",
      padding: "8px 10px",
      borderRadius: "8px",
    }}>
      {slots?.default?.()}
    </div>
  }
})

const Message = defineComponent({
  setup(_props, { slots }) {
    return () => <div style={{
      display: "flex",
      justifyContent: "center",
      margin: "4px 10px",
      color: "inherit",
      flex: "1 1 auto",
      whiteSpace: "pre-line"
    }}>
      {slots?.default?.()}
    </div>
  }
})

const createToastBarProps = () => ({
  toast: Object as PropType<Toast>,
  position: String as PropType<ToastPosition>,
  style: Object as PropType<CSSProperties>,
})

export const getAnimationStyle = (
  position: ToastPosition,
  visible: boolean
): CSSProperties => {
  const top = position.includes('top');
  const factor = top ? 1 : -1;

  const [enter, exit] = prefersReducedMotion()
    ? [fadeInAnimation, fadeOutAnimation]
    : [enterAnimation(factor), exitAnimation(factor)];

  return {
    animation: visible
      ? `${keyframes(enter)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`
      : `${keyframes(exit)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`,
  };
};

export const ToastBar = defineComponent({
  name: "ToastBar",
  inheritAttrs: false,
  props: createToastBarProps(),
  setup(props, { slots }) {
    const animationStyle = computed(() => props.toast.height
      ? getAnimationStyle(
        props.toast.position || props.position || 'top-center',
        props.toast.visible
      )
      : { opacity: 0 });

    const icon = computed(() => <ToastIcon toast={props.toast} />);
    const message = computed(() => (
      <Message {...props.toast.ariaProps}>
        {resolveValue(props.toast.message, props.toast)}
      </Message>
    ));

    return () => (
      <ToastBarBase
        class={props.toast.className}
        style={{
          ...animationStyle.value,
          ...props.style,
          ...props.toast.style,
        }}
      >
        {typeof slots?.default === 'function' ? (
          slots.default({
            icon: icon.value,
            message: message.value,
          })
        ) : (
          <>
            {icon.value}
            {message.value}
          </>
        )}
      </ToastBarBase>
    );
  }

})
