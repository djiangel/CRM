
import React, { Component, Fragment } from 'react';
import { withAlert } from 'react-alert';
import { connect } from 'react-redux';

class Alerts extends Component {
  componentDidUpdate(prevProps) {
    const { error, alert, message } = this.props;
    if (error !== prevProps.error && error) {
      const newerror = error[error.length - 1]
        if (newerror.detail === "Given token not valid for any token type") return alert.error('Your session has ended , please reverify your credentials');
        if (newerror.detail) return alert.error(newerror.detail) 
        if (newerror.email)  return alert.error(newerror.email)
        if (newerror.message)  return alert.error(newerror.message[0])
        if (newerror.new_password) return alert.error(newerror.new_password[0] + newerror.new_password[1]);
        if (newerror.old_password) return alert.error(newerror.old_password);
        if (newerror.non_field_errors) return alert.error(newerror.non_field_errors);
        if (newerror.custom) return alert.error(newerror.custom);
        return alert.error('There has been an error! Please contact our staff');
    }
    if (message !== prevProps.message  && message) {
      alert.success(message[message.length - 1])
    }
  }

  render() {
    return <Fragment />;
  }
}

const mapStateToProps = (state) => ({
  error: state.messages.error,
  message: state.messages.message,
});

export default connect(mapStateToProps)(withAlert()(Alerts));