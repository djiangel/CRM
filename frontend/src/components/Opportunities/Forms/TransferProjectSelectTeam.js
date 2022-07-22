import React, { Component } from 'react'
import { Form, Select, Button , Spin} from 'antd';
import axiosInstance from '../../../api/axiosApi';
const Option = Select.Option;
const validateMessages = {
    required: '${label} is required!',
  };


class TransferProjectSelectTeam extends Component {
    state = {
        team : [],
        done:false
    }
    componentDidMount(){
        axiosInstance.get(`/user-profile/${this.props.next_department}/getotherusers/`)
            .then(response => {
                this.setState({ data: response.data })
                this.setState({done:true})
            });
    }

    onSubmit = () => {
        this.props.submittedValues(this.state.team);
        this.props.handleNextButton();
    }

    onChange = (value) => {
        this.setState({team: value})
    };

    render(){
    return (
        this.state.done?
        <Form onFinish={this.onSubmit} validateMessages={validateMessages}>
            <Form.Item label="Field One" rules={[{ required: true }]}>
            <Select
                showSearch
                mode="multiple"
                style={{ width: 200 }}
                placeholder="Select the Team"
                onChange={this.onChange}
                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
                {this.state.data.map(user => 
                            <Option value={user.id}>{user.user.username}</Option>
                )
                 }
            </Select>
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
        :
        <Spin></Spin>
    );
}
}
export default (TransferProjectSelectTeam);