import { computed, CSSProperties, defineComponent, PropType, shallowRef, watch } from 'vue';
import { css } from 'goober';
import {
  DefaultToastOptions,
  resolveValue,
  ToastPosition,
} from '../core/types';
import { useToaster } from '../core/use-toaster';
import { prefersReducedMotion } from '../core/utils';
import { getAnimationStyle, ToastBar } from './toast-bar.tsx';

const createToasterProps = () => ({
  position: String as PropType<ToastPosition>,
  toastOptions: Object as PropType<DefaultToastOptions>,
  reverseOrder: Boolean,
  gutter: Number,
  containerStyle: Object as PropType<CSSProperties>,
  containerClassName: String,
})

const createToastWrapperProps = () => ({
  id: String,
  className: String,
  style: Object as PropType<CSSProperties>,
  onHeightUpdate: Function as PropType<(id: string, height: number) => void>
})
const ToastWrapper = defineComponent({
  name: "ToastWrapper",
  props: createToastWrapperProps(),
  setup(props, { slots }) {
    const ref = shallowRef()
    watch(ref, (el: HTMLElement | null) => {
      if (el) {
        const updateHeight = () => {
          const height = el.getBoundingClientRect().height;
          props.onHeightUpdate(props.id, height);
        };
        updateHeight();
        new MutationObserver(updateHeight).observe(el, {
          subtree: true,
          childList: true,
          characterData: true,
        });
      }
    })

    return () => (
      <div ref={ref} class={props.className} style={props.style}>
        {slots?.default()}
      </div>
    );
  }
})


const getPositionStyle = (
  position: ToastPosition,
  offset: number
): CSSProperties => {
  const top = position.includes('top');
  const verticalStyle: CSSProperties = top ? { top: 0 } : { bottom: 0 };
  const horizontalStyle: CSSProperties = position.includes('center')
    ? {
      justifyContent: 'center',
    }
    : position.includes('right')
      ? {
        justifyContent: 'flex-end',
      }
      : {};
  return {
    left: 0,
    right: 0,
    display: 'flex',
    position: 'absolute',
    transition: prefersReducedMotion()
      ? undefined
      : `all 230ms cubic-bezier(.21,1.02,.73,1)`,
    transform: `translateY(${offset * (top ? 1 : -1)}px)`,
    ...verticalStyle,
    ...horizontalStyle,
  };
};

const activeClass = css`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;

const DEFAULT_OFFSET = 16;

export const Toaster = defineComponent({
  name: "Toaster",
  props: createToasterProps(),
  setup(props, { slots }) {
    const { toasts, handlers } = useToaster(props.toastOptions);
    const meragedPosition = computed(() => props.position || "top-center")
    return () => (
      <div
        style={{
          position: 'fixed',
          zIndex: 9999,
          top: DEFAULT_OFFSET + 'px',
          left: DEFAULT_OFFSET + 'px',
          right: DEFAULT_OFFSET + 'px',
          bottom: DEFAULT_OFFSET + 'px',
          pointerEvents: 'none',
          ...props.containerStyle,
        }}
        class={props.containerClassName}
        onMouseenter={handlers.startPause}
        onMouseleave={handlers.endPause}
      >
        {toasts.value.map((t) => {
          const toastPosition = t.position || meragedPosition.value;
          const offset = handlers.calculateOffset(t, {
            reverseOrder: props.reverseOrder,
            gutter: props.gutter,
            defaultPosition: meragedPosition.value,
          });

          const positionStyle = getPositionStyle(toastPosition, offset);
          return (
            <ToastWrapper
              id={t.id}
              key={t.id}
              onHeightUpdate={handlers.updateHeight}
              className={t.visible ? activeClass : ''}
              style={positionStyle}
            >
              {
                t.type === 'custom' ? (
                  <div style={{ ...getAnimationStyle(t.position, t.visible) }}>
                    {
                      resolveValue(t.message, t)
                    }
                  </div>
                ) : slots?.default ? (
                  slots.default?.(t)
                ) : (
                  <ToastBar toast={t} position={toastPosition} />
                )
              }
            </ToastWrapper>
          );
        })}
      </div>
    );
  }
})
