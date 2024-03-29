import { css, keyframes } from "goober";
import { defineComponent } from "vue";

export interface WarningTheme {
  primary?: string;
  secondary?: string;
}

const circleAnimation = keyframes`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`;

const firstLineAnimation = keyframes`
0% {
  opacity: 0;
  scale: 0;
  height: 0px;
}
100% {
  opacity: 1;
  scale: 1;
  height: 7px
}`;

const secondLineAnimation = keyframes`
0% {
  opacity: 0;
  scale: 0;
}
100% {
  opacity: 1;
  scale: 1;
}`;

const warningIconStyle = (props: WarningTheme) => css`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${props.primary || '#ffb310'};
  position: relative;

  animation: ${circleAnimation} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  animation-delay: 100ms;

  &:before, &:after {
    content: '';
    display: block;
    position: absolute;
  }

  &:before {
    animation: ${firstLineAnimation} 0.2s ease-out forwards;
    opacity: 0;
    background: ${props.secondary || '#fff'};
    top: 4px;
    left: 9px; 
    width: 2px;
    height: 7px;
    animation-delay: 200ms;
  }

  &:after {
    animation: ${secondLineAnimation} 0.2s ease-out forwards;
    opacity: 0;
    background: ${props.secondary || '#fff'};
    bottom: 5px;
    left: 9px;
    width: 2px;
    height: 2px;
    border-radius: 1px;
    animation-delay: 300ms;
  }
`;


export const WarningIcon = defineComponent({
  name: "WarningIcon",
  props: ['primary', 'secondary'],
  setup(props) {
    return () => <div class={warningIconStyle(props)}>
    </div>
  }
})
