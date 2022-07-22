import React, { Fragment } from 'react';
import { Form, Input, Button, Spin , Drawer , Row , Col, Typography , Card} from 'antd/lib';
import { connect } from 'react-redux';
import { Alert } from 'antd';

const { Text } = Typography;
class PasswordSettings extends React.Component {
    formRef = React.createRef();
    state = { visible: false };

    onFinish = values => {
        this.props.changePW(values.old_password, values.new_password)
    }

    onFinishFailed = errorInfo => {
        console.log('Failed:', errorInfo);
    };

    
  showDrawer = () => {
    this.setState({
      visible: true,
    });
  };

  onClose = () => {
    this.setState({
      visible: false,
    });
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
                          <Card>
                          <Row>
                            <Col span={24}>
                            <Text>Click Here to change your Nobo password.</Text>
                            </Col>
                            <Col span={24} style={{paddingTop:20}}>
                            <Button type="primary" onClick={this.showDrawer}>Change Password
                      </Button>
                          </Col>
                          </Row>
                        <Drawer
                        title="Change Password"
                        placement="right"
                        closable={true}
                        onClose={this.onClose}
                        visible={this.state.visible}
                        width={600}
                      >
                          <Form
                        name="basic"
                        initialValues={{
                            remember: true,
                        }}
                        layout="vertical"
                        onFinish={this.onFinish}
                        onFinishFailed={this.onFinishFailed}
                        style={{ paddingTop: '3%' }}>
                          <Row gutter={16}>
                          <Col span={24}>
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
                        </Col>
                        </Row>
                        <Row  gutter={16}>
                        <Col span={12}>
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
                        </Col>
                        <Col span={12}>
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
                        </Col>
                        </Row>
                        <Row>
                        <Form.Item>
                          <Button type="primary" htmlType="submit">
                            Change Password
                          </Button>
                        </Form.Item>
                        </Row>
                      </Form>
                      </Drawer>
                      </Card>
                      
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

export default connect(mapStateToProps, mapDispatchToProps)(PasswordSettings);