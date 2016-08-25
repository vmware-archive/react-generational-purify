require('./spec_helper');

describe('Purify', () => {
  let subject;
  beforeEach(() => {
    subject = require('../index');
  });

  describe('when the component is not a function', () => {
    it('throws an invariant violation error', () => {
      const anObject = {};
      expect(() => {
        const Component = subject(anObject);
        React.render(<Component/>, root);
      }).toThrowError('purify requires a function but was: [object Object]');
    });
  });

  describe('when the component is a function', () => {
    let Component, numberOfRenders;
    beforeEach(() => {
      numberOfRenders = 0;
      const PureComponent = function(props, context) {
        numberOfRenders++;
        return (<article {...props} {...context}/>);
      };
      PureComponent.contextTypes = {
        id: React.PropTypes.string
      };
      Component = subject(PureComponent, {defaultPropTypes: {foo: 1}});
    });

    it('adds the class properties', () => {
      ReactDOM.render(<Component className="pure-component"/>, root);
      expect(Component.defaultPropTypes).toEqual({foo: 1});
    });

    it('returns a react component', () => {
      ReactDOM.render(<Component className="pure-component"/>, root);
      expect('.pure-component').toExist();
    });

    it('re-renders when there is a change in props', () => {
      let props = {className: 'first-render'};
      ReactDOM.render(<Component {...props}/>, root);
      expect('.first-render').toExist();

      props = {className: 'second-render'};
      ReactDOM.render(<Component {...props}/>, root);
      expect('.first-render').not.toExist();
      expect('.second-render').toExist();
    });

    it('does not re-render when the props do not change', () => {
      const props = {className: 'first-render'};
      ReactDOM.render(<Component {...props}/>, root);
      expect(numberOfRenders).toBe(1);
      ReactDOM.render(<Component {...props}/>, root);
      expect(numberOfRenders).toBe(1);
    });

    it('reuses the renders for the same component', () => {
      const props = {className: 'first-render'};
      const components = [1,2,3].map(key => {
        return (<Component {...props} {...{key}}/>);
      });
      ReactDOM.render(
        <div>
          <Component {...{id: 'different'}}/>
          {components}
          <Component {...{id: 'different'}}/>
        </div>, root);
      expect(numberOfRenders).toBe(2);
    });

    it('does not re-render if props were recently used', () => {
      const props = {className: 'first-render'};
      ReactDOM.render(<Component {...props}/>, root);
      expect(numberOfRenders).toBe(1);
      MockNextTick.next();
      ReactDOM.render(<Component {...props}/>, root);
      expect(numberOfRenders).toBe(1);
    });

    it('does re-render if props have expired', () => {
      const props = {className: 'first-render'};
      const otherProps = {className: 'second-render'};
      ReactDOM.render(<Component {...props}/>, root);
      expect(numberOfRenders).toBe(1);
      MockNextTick.next();
      ReactDOM.render(<Component {...otherProps}/>, root);
      expect(numberOfRenders).toBe(2);
      MockNextTick.next();
      ReactDOM.render(<Component {...props}/>, root);
      expect(numberOfRenders).toBe(3);
    });

    it('does not expire props if other components are rendered', () => {
      const OtherComponent = subject(() => <div>other</div>);
      const props = {className: 'first-render'};
      ReactDOM.render(<Component {...props}/>, root);
      expect(numberOfRenders).toBe(1);
      MockNextTick.next();
      ReactDOM.render(<OtherComponent {...props}/>, root);
      MockNextTick.next();
      ReactDOM.render(<Component {...props}/>, root);
      expect(numberOfRenders).toBe(1);
    });

    describe('and props is empty', () => {
      it('renders the component', () => {
        ReactDOM.render(<Component/>, root);
        expect('article').toExist();
      });
    });

    describe('when there is a context', () => {
      it('re-renders when there is a change in context', () => {
        let context = {id: 'first-render'};
        withContext(context, () => <Component/>, root);
        expect('#first-render').toExist();

        context = {id: 'second-render'};
        withContext(context, () => <Component/>, root);
        expect('#first-render').not.toExist();
        expect('#second-render').toExist();
      });

      it('does not re-render when the context does not change', () => {
        const context = {id: 'first-render'};
        withContext(context, () => <Component/>, root);
        expect(numberOfRenders).toBe(1);
        withContext(context, () => <Component/>, root);
        expect(numberOfRenders).toBe(1);
      });
    });
  });
});