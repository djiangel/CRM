import React, { Component } from 'react'
import { Form, Input, Button } from 'antd';

const validateMessages = {
    required: '${label} is required!',
};

class TransferProjectJustification extends Component {

    onSubmit = (values) => {
        this.props.handleNextButton();
    }
    render() {
        return (
            <Form onFinish={this.onSubmit} validateMessages={validateMessages} initialValue={this.props.department}>
                <Form.Item label="Field One">
                    <Input.TextArea rows={6} />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Next
                </Button>
                    <Button type="default" onClick={() => this.props.handleBackButton()} >
                        Back
                </Button>
                </Form.Item>
            </Form>
        );
    }
}

export default (TransferProjectJustification);