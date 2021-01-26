import overflowEllipsis from 'app/styles/overflowEllipsis';
import {Theme} from 'app/utils/theme';

export const layout = (theme: Theme) => `
> * {
  overflow: hidden;

  :nth-child(-n + 5) {
    ${overflowEllipsis};
    :nth-child(5n - 1) {
      text-align: center;
    }
  }

  :nth-child(5n - 4),
  :nth-child(5n - 3) {
    display: none;
  }

  :nth-child(5n) {
    overflow: visible;
  }
}

grid-template-columns: 1.5fr 1fr 0.5fr;

@media (min-width: ${theme.breakpoints[0]}) {
  > * {
    :nth-child(5n - 4),
    :nth-child(5n - 3) {
      display: flex;
    }
  }

  grid-template-columns: 0.5fr 1fr 1.5fr 1fr 0.5fr;
}

@media (min-width: ${theme.breakpoints[2]}) {
  grid-template-columns: 0.5fr 1fr 2fr 1fr 0.5fr;
}
`;
