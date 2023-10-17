/* eslint-disable prefer-destructuring */
require('jest-expect-message');
const { matchers } = require('jest-json-schema');

expect.extend(matchers);

jest.setTimeout(20000);
