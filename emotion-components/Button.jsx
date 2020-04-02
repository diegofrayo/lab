import React from 'react';
import PropTypes from 'prop-types';
import { styled, keyMirror } from '@diegofrayo/styles';

import { Icon } from 'components/lib';

const Button = ({ children, type, disabled, theme, loading, onClick }) => {
  return (
    <ButtonElement
      type={type}
      disabled={disabled}
      theme={theme}
      loading={`${loading}`}
      onClick={onClick}
    >
      {loading ? <Icon name="loading" /> : children}
    </ButtonElement>
  );
};

Button.theme = keyMirror(['primary']);

Button.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
    PropTypes.string,
  ]).isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  theme: PropTypes.string,
  type: PropTypes.string,
};

Button.defaultProps = {
  disabled: false,
  loading: false,
  theme: Button.theme.primary,
  type: 'button',
};

// ----- Components -----

const ButtonElement = styled.button(
  ({ theme, utils, props }) => `
    border-radius: 5px;
    opacity: ${props.disabled ? 0.6 : 1};
    padding: ${theme.space[2]}px ${theme.space[3]}px;
    text-transform: uppercase;
    transition: all 0.8s;
    width: 100%;
    ${utils.switch(props.theme, {
      [Button.theme.primary]: `
        background: ${theme.colors.green};
        background: radial-gradient(circle, ${theme.colors.green} 0%, ${utils.lighten(
        theme.colors.green,
        0.1,
      )} 75%);
        color: white;
      `,
      default: '',
    })}
    ${utils.if(props.loading === 'true', {
      true: `
        cursor: progress;
        transform: translateY(4px);
      `,
      false: `
        cursor: pointer;
      `,
    })}
  `,
);

export default Button;
