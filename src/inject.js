/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

// Inspired by react-redux's `connect()` HOC factory function implementation:
// https://github.com/rackt/react-redux

import React, {Component} from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import invariant from 'invariant';
import {intlShape} from './types';
import {invariantIntlContext} from './utils';

function getDisplayName(Component) {
  return Component.displayName || Component.name || 'Component';
}

export default function injectIntl(WrappedComponent, options = {}) {
  const {intlPropName = 'intl', withRef = false} = options;

  class InjectIntl extends Component {
    static displayName = `InjectIntl(${getDisplayName(WrappedComponent)})`;

    static contextTypes = {
      intl: intlShape,
    };

    static WrappedComponent = WrappedComponent;

    constructor(props, context) {
      super(props, context);
      invariantIntlContext(context);
    }

    getWrappedInstance() {
      invariant(
        withRef,
        '[React Intl] To access the wrapped instance, ' +
          'the `{withRef: true}` option must be set when calling: ' +
          '`injectIntl()`'
      );

      return this._wrappedInstance;
    }

    // patch
    translate = (id, value) => {
      if (typeof id === 'string' && id !== '') {
        return this.context.intl.formatMessage.call(this, { id }, value);
      }
      // something's iffy with that _t( <id> )
      return 'invalid translation key';
    };

    render() {
      return (
        <WrappedComponent
          {...this.props}
          {...{[intlPropName]: this.context.intl}}
          ref={withRef ? /* istanbul ignore next */ (ref => this._wrappedInstance = ref) : null}
        />
      );
    }
  }

  return hoistNonReactStatics(InjectIntl, WrappedComponent);
}
