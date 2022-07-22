import React from 'react';
import { Form, Input, Button , Drawer , Row , Col, Typography , Card} from 'antd/lib';
import { connect } from 'react-redux';

const { Text } = Typography;
class EmailSettings extends React.Component {
    formRef = React.createRef();
    state = { visible: false };

    onFinish = values => {
        const data = {
                "email" : values.email,
                "email_password" : values.new_password,
        }
        this.props.updateUserprofile(this.props.auth,data)
        this.onClose()
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
        return (
                      <Card>
                          <Row>
                            <Col span={24}>
                            <Text>Click Here to change your Email password.</Text>
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
                            <Row>
                                <Col span={24}>
                            <Form.Item
                          name="email"
                          label="Your email"
                          label="E-mail"
                          initialValue={this.props.userprofile.email}
                          rules={[
                            {
                              type: 'email',
                              message: 'The input is not valid E-mail!',
                            },
                            {
                              required: true,
                              message: 'Please input your E-mail!',
                            },
                          ]}
                        >
                          <Input/>

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
        )
    }
}


const mapStateToProps = (state) => {
    return {
        auth: state.auth.userprofile,
        userprofile: state.userprofile.userprofile,
    }
}

const mapDispatchToProps = (dispatch) => {
  return {
      updateUserprofile: (id,data) => dispatch({ type: 'UPDATE_USERPROFILE', id: id , data:data})
  }
}



export default connect(mapStateToProps, mapDispatchToProps)(EmailSettings);