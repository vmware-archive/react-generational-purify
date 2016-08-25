#React Generational Purify

[![Build Status](https://travis-ci.org/pivotal-cf/react-generational-purify.svg?branch=master)](https://travis-ci.org/pivotal-cf/react-generational-purify)

A version of React's [PureRenderMixin](https://facebook.github.io/react/docs/pure-render-mixin.html) for functional components.

For more motivation, check out the React [Advanced Performance Docs](https://facebook.github.io/react/docs/advanced-performance.html).

## Usage

```sh
npm install react-generational-purify --save
```

```js
const purify = require('react-generational-purify');

const PureFunComp = purify(props => <div>{props.foo}</div>);
```

The `PureFunComp` component will now skip rendering if the props and context have not changed.

## Why Generational

Functional components are difficult to memoize because they do not have a `this` and you cannot tell the difference between different instances of the same component.
An implementation of `purify` is to remember the `props` and `context` for the last render of each functional component. 
Then on the next render, you can skip rendering if the `props` and `context` have not changed. 
This implementation is limited if you have components with more than one instance on the page, e.g.:

```js
const purify = require('react-generational-purify');
const Item = purify(props => <li>{props.position}</li>);
```
```jsx
<ul>
  <Item position="first" key={0}/>
  <Item position="second" key={1}/>
</ul>
```

If different instances receive different `props`, the render method will never be skipped. 

Another implementation of `purify` is to remember all combinations of `props` and `context` passed into `render`.
This does skip rendering efficiently, but uses a lot of memory and can eventually crash the browser in many applications.

In the generational implementation, we keep track of all combinations of `props` and `context` that have been passed into render in the last generation. 
A generation is defined as a group of synchronous render calls. In the flux pattern, it is common to always re-render the top level component in your application. 
This will then synchronously render all children of the application, which eventually re-renders all instances of all components on the screen.

In the above example, if you render the `ul`, rendering `Item` with `{position: "first"}` and rendering `Item` with `{position: "second"}` will both be tracked.
When you re-render the `ul`, it will know about both previous renders of `Item` and skip rendering on them. This will be true no matter how many times you render `ul`.

The net effect is that in each top-level render of your application, only the instances of components that have changed since the last top-level render will be rendered.



