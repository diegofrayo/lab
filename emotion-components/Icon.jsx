import React from 'react';
import PropTypes from 'prop-types';
import { color, space } from 'styled-system';
import styled from '@emotion/styled';

import UtilsService from 'services/utils';

const ICONS = {
  award: 'award',
  check: 'check-alt',
  clouds: 'clouds',
  contributions: 'worker',
  email: 'email',
  foot: 'foot-print',
  home: 'home',
  location: 'location-pin',
  muscle: 'muscle',
  password: 'ui-password',
  profile: 'ui-user',
  rocket: 'rocket',
  smile: 'simple-smile',
  work: 'worker',
};

const Icon = ({ name, size, ...rest }) => {
  if (name === 'loading') {
    return <img src="/images/loader.svg" alt="Loading..." />;
  }

  if (!ICONS[name]) {
    return <span>?</span>;
  }

  return (
    <IconElement
      className={`eco-icon icofont-${ICONS[name]} icofont-${size}x`}
      {...rest}
    />
  );
};

const IconElement = styled.i`
  ${color}
  ${space}
`;

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.oneOf(UtilsService.createArray(5, 1)),
};

Icon.defaultProps = {
  size: 1,
};

export default Icon;
