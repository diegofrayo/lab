import './reset.css';
import { setTheme, extendUtils } from '@diegofrayo/styles';
import Color from 'color';
import { UtilsService } from 'services';

const createColorScale = (length, baseColor, scale) => {
  return UtilsService.createArray(length).map(i => {
    return baseColor
      .darken((i + 1) * scale)
      .rgb()
      .toString();
  });
};

const breakpoints = ['640px', '940px', '1199px'];
const breakpointsNumbers = [640, 940, 1199];

const theme = {
  space: [4, 8, 16, 32, 64, 128, 256, 512],

  colors: {
    red: '#ff4b4b',
    green: 'rgb(20, 170, 0)',
    gray: '#eaeaea',
    blue: 'rgb(0, 168, 255)',
    yellow: '#e4e41c',

    grays: createColorScale(10, Color('#eaeaea'), 0.1),
    blues: createColorScale(10, Color('rgb(0, 168, 255)'), 0.1),
    yellows: createColorScale(10, Color('#e4e41c'), 0.1),
  },

  fontSizes: ['0.7em', '0.9em', '1em', '1.2em', '1.5em', '1.8em', '2em', '3em'],

  breakpoints,

  mediaQueries: {
    small: `@media screen and (max-width: ${breakpoints[0]}px)`,
    'small-up': `@media screen and (min-width: ${breakpointsNumbers[0] + 1}px)`,
    'medium-portrait': `@media screen and (min-width: ${breakpointsNumbers[0] +
      1}px) and (max-width: ${breakpoints[1]}px)`,
    'medium-landscape': `@media screen and (min-width: ${breakpointsNumbers[1] +
      1}px) and (max-width: ${breakpoints[2]}px)`,
    large: `@media screen and (max-width: ${breakpointsNumbers[2] + 1}px)`,
    landscape: `@media screen and (max-width: ${
      breakpoints[1]
    }) and (orientation: landscape)`,
  },
};

setTheme(theme);

extendUtils({
  lighten: (color, percent = 0.5) => {
    return Color(color).lighten(percent);
  },
  darken: (color, percent = 0.5) => {
    return Color(color).darken(percent);
  },
});

export default theme;

// ---

import './reset.css';
import { setTheme, extendUtils } from '@diegofrayo/styles';
import Color from 'color';
import { UtilsService } from 'services';

const createColorScale = (length, baseColor, scale) => {
  return UtilsService.createArray(length).map(i => {
    return baseColor
      .darken((i + 1) * scale)
      .rgb()
      .toString();
  });
};

const breakpoints = ['576px', '768px', '992px'];
const breakpointsNumbers = [576, 768, 992];

const theme = {
  space: [4, 8, 16, 32, 64, 128, 256, 512],

  colors: {
    red: '#ff4b4b',
    green: 'rgb(20, 170, 0)',
    gray: '#eaeaea',
    blue: 'rgb(0, 168, 255)',
    yellow: '#e4e41c',

    grays: createColorScale(10, Color('#eaeaea'), 0.1),
    blues: createColorScale(10, Color('rgb(0, 168, 255)'), 0.1),
    yellows: createColorScale(10, Color('#e4e41c'), 0.1),
  },

  fontSizes: ['0.7em', '0.9em', '1em', '1.2em', '1.5em', '1.8em', '2em', '3em'],

  breakpoints,

  mediaQueries: {
    small: `@media screen and (min-width: ${
      breakpoints[0]
    }px) and (max-width: ${breakpointsNumbers[1] - 1}px)`,
    medium: `@media screen and (min-width: ${breakpointsNumbers[1]}px)`,
    large: `@media screen and (min-width: ${breakpointsNumbers[2]}px)`,

    'small-up': `@media screen and (min-width: ${breakpointsNumbers[1] + 1}px)`,

    landscape: `@media screen and (max-width: ${
      breakpoints[1]
    }) and (orientation: landscape)`,

    // 'medium-portrait': `@media screen and (min-width: ${breakpointsNumbers[0] +
    //   1}px) and (max-width: ${breakpoints[1]}px)`,
    // 'medium-landscape': `@media screen and (min-width: ${breakpointsNumbers[1] +
    //   1}px) and (max-width: ${breakpoints[2]}px)`,
  },
};

setTheme(theme);

extendUtils({
  lighten: (color, percent = 0.5) => {
    return Color(color).lighten(percent);
  },
  darken: (color, percent = 0.5) => {
    return Color(color).darken(percent);
  },
});

export default theme;
