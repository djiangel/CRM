import React from 'react';
import { Form, Input, Button, Spin } from 'antd/lib';
import { connect } from 'react-redux';
import { Alert } from 'antd';

const layout = {
    labelCol: {
        span: 10,
    },
    wrapperCol: {
        span: 4,
    },
};
const tailLayout = {
    wrapperCol: {
        offset: 10,
        span: 16,
    },
};


class ChangePassword extends React.Component {
    formRef = React.createRef();

    onFinish = values => {
        this.props.changePW(values.old_password, values.new_password)
    }

    onFinishFailed = errorInfo => {
        console.log('Failed:', errorInfo);
    };

    render() {
        let errorMessage = null;
        if (this.props.auth.error) {
            errorMessage = (
                <Alert message={this.props.auth.error} type="error" />
            );
        }
        return (
            <div>
                <div>
                    {errorMessage}
                </div>
                {
                    this.props.auth.loading ?

                        <Spin size="large" />

                        :


                        <Form
                        {...layout}
                        name="basic"
                        initialValues={{
                            remember: true,
                        }}
                        onFinish={this.onFinish}
                        onFinishFailed={this.onFinishFailed}
                        style={{ paddingTop: '3%' }}>

        <Form.Item
        name="old_password"
        label="Old Password"
        rules={[
          {
            required: true,
            message: 'Please input your previous password!',
          },
        ]}
        hasFeedback
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        name="new_password"
        label="New Password"
        rules={[
          {
            required: true,
            message: 'Please input your  new password!',
          },
          ({ getFieldValue }) => ({
            validator(rule, value) {
              if (!value || getFieldValue('old_password') === value) {
                return Promise.reject('Please do not use the previous password!')
              }

              return Promise.resolve();;
            },
          }),
        ]}
        hasFeedback
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        name="confirm"
        label="Confirm Password"
        dependencies={['new_password']}
        hasFeedback
        rules={[
          {
            required: true,
            message: 'Please confirm your password!',
          },
          ({ getFieldValue }) => ({
            validator(rule, value) {
              if (!value || getFieldValue('new_password') === value) {
                return Promise.resolve();
              }

              return Promise.reject('The two passwords that you entered do not match!');
            },
          }),
        ]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item {...tailLayout}>
        <Button type="primary" htmlType="submit">
          Change Password
        </Button>
      </Form.Item>
    </Form>
                }
            </div>
        )
    }
}


const mapStateToProps = (state) => {
    return {
        auth: state.auth,
    }
}


const mapDispatchToProps = dispatch => {
    return {
        changePW: (old_password, new_password) => dispatch({  type: 'CHANGE_PASSWORD' , old:old_password, new:new_password}),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ChangePassword);