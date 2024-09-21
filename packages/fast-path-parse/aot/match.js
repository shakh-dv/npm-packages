const segmentsSlice = require('../utils/segment.js');

/**
 * @type {import('./match')}
 */
// eslint-disable-next-line max-lines-per-function, complexity
const match = (path, compact) => {
  const { segments, filled } = segmentsSlice(path, compact);

  if (filled.length > 0) {
    let aotJit = `function matchPath(pathname) {
        let uri = pathname;

        let i;
        let lastIndex = 1;
        let isValid = true;

        let value;`;

    for (const segment of segments) {
      aotJit += `
        if (!isValid) { return false; }

        i = uri.indexOf('/', lastIndex)`;

      if (segment.last) {
        aotJit += `
          value = i === -1 ? uri.substring(lastIndex) : uri.substring(lastIndex, i);
          `;
      } else {
        aotJit += `
          if (i < ${segment.position}) { return false; }
          value = uri.substring(lastIndex, i);
          `;
      }

      if (segment.segment) {
        aotJit += `
          isValid = value.length > 0;`;
      } else {
        aotJit += `
          isValid = value === '${segment.name}';`;
      }

      aotJit += `
        lastIndex = i + 1`;
    }
    aotJit += `
        return isValid;
    }`;

    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    return new Function(`return ${aotJit}`)();
  }

  return (url) =>
    url === path ||
    `${url}/` === path ||
    url === `${path}/` ||
    `/${url}` === path ||
    url === `/${path}`;
};

module.exports = match;
