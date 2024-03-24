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
  stacked: Boolean
})

const createToastWrapperProps = () => ({
  id: String,
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
      <div ref={ref} id={props.id} key={props.id}>
        {slots?.default()}
      </div>
    );
  }
})

const activeClass = css`
z-index: 9999;
> * {
  pointer-events: auto;
}
`;
const DEFAULT_OFFSET = '16px';

export const Toaster = defineComponent({
  name: "Toaster",
  props: createToasterProps(),
  setup(props, { slots }) {
    const { toasts, handlers } = useToaster(props.toastOptions);
    const meragedPosition = computed(() => props.position || "top-center")
    const meragedToasts = computed(() => props.stacked ? toasts.value.reverse() : toasts.value)
    const collapsed = shallowRef(true)
    const setIsCollapsed = (v: boolean) => collapsed.value = v
    const containerRef = shallowRef<HTMLElement>()
    function collapseAll() {
      if (props.stacked) {
        setIsCollapsed(true);
      }
    }
    function onMouseenter() {
      if (props.stacked) {
        setIsCollapsed(false);
      }
      handlers.startPause()
    }

    function onMouseleave() {
      collapseAll()
      handlers.endPause()
    }

    const getPositionStyle = (
      position: ToastPosition,
      offset: number,
      collapsed: boolean,
      prevS: number
    ): CSSProperties => {
      const top = position.includes('top');
      const verticalStyle: CSSProperties = top ? { top: 0 } : { bottom: 0 };
      const horizontalStyle: CSSProperties = position.includes('center')
        ? {
          justifyContent: 'center',
        }
        : position.includes('right')
          ? {
            left: undefined,
          }
          : {
            right: undefined
          };

      let y = offset
      let s = 1
      if (props.stacked) {
        y = offset * (collapsed ? 0.2 : 1)
        if (!top) {
          y = -y
        }
        s = 1 - (collapsed ? prevS : 0)
      }

      return {
        left: 0,
        right: 0,
        display: 'flex',
        position: 'absolute',
        direction: 'ltr',
        transition: prefersReducedMotion()
          ? undefined
          : `all 230ms cubic-bezier(.21,1.02,.73,1)`,
        transform: `translate3d(0, ${y}px, 0) scale(${s})`,
        ...verticalStyle,
        ...horizontalStyle,
      };
    };
    return () => (
      <div
        ref={containerRef}
        style={{
          position: 'fixed',
          zIndex: 9999,
          top: DEFAULT_OFFSET,
          left: DEFAULT_OFFSET,
          right: DEFAULT_OFFSET,
          bottom: DEFAULT_OFFSET,
          pointerEvents: 'none',
          ...props.containerStyle,
        }}
        class={props.containerClassName}
        onMouseenter={onMouseenter}
        onMouseleave={onMouseleave}
      >
        {meragedToasts.value.map((t, i) => {
          const toastPosition = t.position || meragedPosition.value;
          const offset = handlers.calculateOffset(t, {
            reverseOrder: props.stacked ? true : props.reverseOrder,
            gutter: props.gutter,
            defaultPosition: meragedPosition.value,
          });
          const reverseIdx = toasts.value.length - i - 1
          const positionStyle = getPositionStyle(toastPosition, offset, collapsed.value, reverseIdx * 0.025);
          return (
            <ToastWrapper
              id={t.id}
              key={t.id}
              onHeightUpdate={handlers.updateHeight}
              class={t.visible ? activeClass : ''}
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
