import React from 'react';
import PropTypes from 'prop-types';
import stores from 'nocms-stores';
import utils from 'nocms-utils';

class SubForm extends React.Component {
  constructor(props, context) {
    super(props);
    this.store = `${context.store}-${props.name}`;

    this.onChange = this.onChange.bind(this);
    this.validate = this.validate.bind(this);
  }

  getChildContext() {
    return {
      store: this.store,
    };
  }

  componentWillMount() {
    if (utils.isBrowser()) {
      const initialState = Object.assign({}, this.props.initialState);

      stores.createStore(this.store, initialState, this.onChange);
      stores.patch(this.context.store, { isValid: true, isValidated: false, validate: this.validate });
    }
  }

  onChange(formData) {
    let isValid = true;
    let isValidated = true;

    Object.values(formData).forEach((field) => {
      isValid = isValid && field.isValid;
      isValidated = isValidated && field.isValidated;
    });

    const value = {};
    value[this.props.name] = { value: formData, isValid, isValidated, validate: this.validate, getValue: () => { return this.getValue(); } };

    stores.patch(this.context.store, value);
  }

  getValue() {
    const store = stores.getStore(this.store);
    const value = {};

    Object.keys(store).forEach((key) => {
      if (store[key].getValue) {
        value[key] = store[key].getValue();
      } else {
        value[key] = store[key].value;
      }
    });

    return value;
  }

  validate() {
    let allFieldsAreValid = false;
    const store = stores.getStore(this.store);

    Object.values(store).forEach((field) => {
      let thisFieldIsValid = false;

      if (!field.isValidated) {
        thisFieldIsValid = field.validate();
      }

      allFieldsAreValid = allFieldsAreValid && thisFieldIsValid;
    });

    return allFieldsAreValid;
  }

  render() {
    return <div>{this.props.children}</div> || '';
  }
}

SubForm.propTypes = {
  name: PropTypes.string.isRequired,
  children: PropTypes.node,
  initialState: PropTypes.object,
};


SubForm.childContextTypes = {
  store: PropTypes.string,
};

SubForm.contextTypes = {
  store: PropTypes.string,
};

export default SubForm;
