import React from 'react';
import PropTypes from 'prop-types';
import { color, typography, space } from 'styled-system';
import styled from '@emotion/styled';

const TextElement = styled.p`
  ${color}
  ${space}
  ${typography}
`;

const Text = ({ children, ...rest }) => {
  return (
    <TextElement className="eco-text" {...rest}>
      {children}
    </TextElement>
  );
};

Text.propTypes = {
  children: PropTypes.any.isRequired,
};

export default Text;
