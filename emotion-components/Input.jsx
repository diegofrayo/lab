import React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@diegofrayo/styles';

import Box from 'components/lib/Box';
import Icon from 'components/lib/Icon';

const Input = ({ htmlAttrs, label, icon, error, onChange }) => {
  const isError = !!error;

  return (
    <Container error={isError}>
      <label htmlFor={htmlAttrs.id}>
        <Label>
          {label}
          <Label.Asterisk visible={htmlAttrs.required !== undefined}>*</Label.Asterisk>
        </Label>
        <InputContainer align-x="left" align-y="center" dir="row" error={isError}>
          <IconContainer align="center" visible={icon !== ''} error={isError}>
            <Icon name={icon} />
          </IconContainer>
          <InputElement error={isError} onChange={onChange} {...htmlAttrs} />
        </InputContainer>
      </label>
      <ErrorMessage visible={isError}>{error}</ErrorMessage>
    </Container>
  );
};

Input.propTypes = {
  htmlAttrs: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,

  icon: PropTypes.string,
  error: PropTypes.string,
};

Input.defaultProps = {
  icon: '',
  error: '',
};

// ----- Components -----

const Container = styled.section(
  ({ theme, props }) => `
    color: ${props.error ? theme.colors.red : 'black'};
    transition: all 0.5s;
    width: 100%;
  `,
);

const Label = styled.p(
  ({ theme }) => `
    color: inherit;
    font-weight: 700;
    margin-bottom: ${theme.space[0]}px;
  `,
);

Label.Asterisk = styled.span(
  ({ theme, props }) => `
    color: ${theme.colors.red};
    display: ${props.visible ? 'inline-block' : 'none'};
    margin-left: ${theme.space[0]}px;
  `,
);

const InputContainer = styled(Box)(
  ({ theme, props }) => `
    background-color: ${props.error ? theme.colors.red : theme.colors.gray};
    border-radius: 5px;
    border: 1px solid ${props.error ? theme.colors.red : theme.colors.gray};
    overflow: hidden;
    width: 100%;
  `,
);

const IconContainer = styled(Box)(
  ({ theme, props }) => `
    color: ${props.error ? 'white' : 'inherit'};
    display: ${props.visible ? 'inline-flex' : 'none'};
    flex-shrink: 0;
    height: 40px;
    padding: 0 ${theme.space[2]}px;
  `,
);

const InputElement = styled.input(
  ({ theme, props }) => `
    border: 0;
    border-left: 1px solid ${props.error ? theme.colors.red : theme.colors.gray};
    color: inherit;
    height: 40px;
    outline-color: ${props.error ? theme.colors.red : theme.colors.gray};
    padding: ${theme.space[0]}px ${theme.space[2]}px;
    width: 100%;
  `,
);

const ErrorMessage = styled.p(
  ({ theme, props }) => `
    color: inherit;
    display: ${props.visible ? 'block' : 'none'};
    margin-top: ${theme.space[0]}px;
    text-align: right;
  `,
);

export default Input;
