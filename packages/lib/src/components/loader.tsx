import { keyframes, css } from 'goober';
import { defineComponent } from 'vue';

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export interface LoaderTheme {
  primary?: string;
  secondary?: string;
}

const loaderIconStyle = (props: LoaderTheme) => css`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${props.secondary || '#e0e0e0'};
  border-right-color: ${props.primary || '#616161'};
  animation: ${rotate} 1s linear infinite;
`;

export const LoaderIcon = defineComponent({
  name:"LoaderIcon",
  props: ['primary', 'secondary'],
  setup(props) {
    return () => <div class={loaderIconStyle(props)}>
    </div>
  }
})
