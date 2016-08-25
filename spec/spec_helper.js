const MockNextTick = require('./mock_next_tick');
MockNextTick.install();

require('babel-polyfill');

const $ = require('jquery');
require('jasmine_dom_matchers');

const globals = {
  MockNextTick,
  React: require('react'),
  ReactDOM: require('react-dom'),
  $: $,
  ...require('pivotal-js-react-test-helpers')
};

Object.assign(global, globals);

beforeEach(() => {
  $('body').find('#root').remove().end().append('<div id="root"/>');
});
