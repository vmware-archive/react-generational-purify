const isFunction = require('lodash.isfunction');
const invariant = require('invariant');
const shallowEqual = require('fbjs/lib/shallowEqual');

const privates = new WeakMap();

function getRenders(renderFn) {
  if (!privates.has(renderFn)) privates.set(renderFn, {prevRenders: [], currentRenders: []});
  return privates.get(renderFn);
}

function ageRenders(renderFn, currentRenders) {
  privates.set(renderFn, {prevRenders: currentRenders, currentRenders: []});
}

function findRender(generation, props, context) {
  let index = generation.findIndex(({props: prevProps = {}, context: prevContext = {}}) => {
    return shallowEqual(prevProps, props) && shallowEqual(prevContext, context);
  });
  if (index === -1) return;
  return generation[index].result;
}

module.exports = function(renderFn, classOptions = {}) {
  invariant(isFunction(renderFn), 'purify requires a function but was: %s', renderFn);
  return Object.assign(function(props, context) {
    const {prevRenders, currentRenders} = getRenders(renderFn);
    if (!currentRenders.length) setImmediate(() => {
      ageRenders(renderFn, currentRenders);
    });

    let result;

    [prevRenders, currentRenders].some(generation => {
      result = findRender(generation, props, context);
      if (!result) return false;
      if (currentRenders !== generation) currentRenders.push({props, context, result});
      return true;
    });

    if (result) return result;
    result = this::renderFn(props, context);
    currentRenders.push({props, context, result});
    return result;
  }, {...renderFn, ...classOptions});
};
