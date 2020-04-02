import { color, layout, space, border as borderSS, flexbox, shadow } from 'styled-system';
import styled from '@emotion/styled';

const customFlex = ({
  'align-x': alignXProp,
  'align-y': alignYProp,
  'grow-x': growXProp,
  'grow-y': growYProp,
  align: alignProp,
  tborder,
  dir = 'column',
  grow: growProp,
  size: sizeProp,
  wrap,
}) => {
  let alignX = '';
  let alignY = '';
  let align = '';
  let growX = '';
  let growY = '';
  let grow = '';
  let size = '';
  const border = tborder
    ? `border: 1px solid ${typeof tborder === 'boolean' ? 'red' : tborder};`
    : '';
  const flexWrap = wrap ? 'flex-wrap: wrap;' : '';
  const display = 'display: flex;';
  const direction = `flex-direction: ${dir};`;

  if (dir === 'column') {
    if (alignXProp) {
      alignX = `align-items: ${alignXProp};`;
    }

    if (alignYProp) {
      alignY = `justify-content: ${alignYProp};`;
    }
  } else {
    if (alignXProp) {
      alignX = `justify-content: ${alignXProp};`;
    }

    if (alignYProp) {
      alignY = `align-items: ${alignYProp};`;
    }
  }

  if (growXProp) {
    growX = `width: 100%;`;
  }

  if (growYProp) {
    growY = `
      height: 100%;
    `;
  }

  if (growProp) {
    grow = `
      flex: 1;
    `;
  }

  if (sizeProp) {
    size = `
      height: ${sizeProp}px;
      width: ${sizeProp}px;
    `;
  }

  if (alignProp === 'center') {
    align = `
      align-items: center;
      justify-content: center;
    `;
  } else if (alignProp === 'left') {
    align = 'justify-content: flex-start;';
  } else if (alignProp === 'right') {
    align = 'justify-content: flex-end';
  }

  return `
    ${alignX}
    ${alignY}
    ${align}
    ${border}
    ${direction}
    ${display}
    ${flexWrap}
    ${growX}
    ${growY}
    ${grow}
    ${size}
  `;
};

const Box = styled.section`
  ${customFlex}
  ${borderSS}
  ${color}
  ${flexbox}
  ${layout}
  ${shadow}
  ${space}
`;

export default Box;
