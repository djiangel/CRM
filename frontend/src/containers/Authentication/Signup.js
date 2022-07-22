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


class SignUp extends React.Component {
    formRef = React.createRef();

    onFinish = values => {
        this.props.createUser(values.username, values.password)
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
                                name="username"
                                label="Username"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your username!',
                                    },
                                ]}
                                hasFeedback
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                label="Password"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your password!',
                                    },
                                ]}
                                hasFeedback
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item
                                name="password2"
                                label="Confirm Password"
                                dependencies={['password']}
                                hasFeedback
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please confirm your password!',
                                    },
                                    ({ getFieldValue }) => ({
                                        validator(rule, value) {
                                            if (!value || getFieldValue('password') === value) {
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
                                    Create User
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
        createUser: (username, password) => dispatch({ type: 'SIGN_UP', username: username, password: password }),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SignUp);