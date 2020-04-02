import PropTypes from 'prop-types';
import { styled, keyMirror } from '@diegofrayo/styles';

const Type = keyMirror(['horizontal', 'vertical']);

const Separator = styled.section(
  ({ props, utils }) => `
    display: ${props.type === Type.vertical ? 'inline-block' : 'block'};
    ${utils.if(props.type === Type.horizontal, {
      true: `
        height: 1px;
        ${utils.marginY(props.size)}
      `,
      false: `
        width: 1px;
        ${utils.marginX(props.size)}
      `,
    })}
  `,
);

Separator.type = Type;

Separator.propTypes = {
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  type: PropTypes.oneOf(Object.values(Separator.type)),
};

Separator.defaultProps = {
  size: 0,
  type: Separator.type.horizontal,
};

export default Separator;
