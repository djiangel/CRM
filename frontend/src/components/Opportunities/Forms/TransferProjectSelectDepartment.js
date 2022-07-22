import React, { Component } from 'react'
import { Form, Select , Button , Spin } from 'antd';
import axiosInstance from '../../../api/axiosApi';
import { connect } from 'react-redux';

const Option = Select.Option;
const validateMessages = {
    required: '${label} is required!',
  };

class TransferProjectSelectDepartment extends Component {
    state = {
        department:{},
        done:false
    }

    componentDidMount(){
        axiosInstance.get('/sales-department/')
            .then(response => {
                const cleaned_departments = response.data.filter(dep => {
                    if( dep.department_id !== this.props.current_department ){
                        return dep
                    }})
                this.setState({ data: cleaned_departments});
                this.setState({ done: true });
            });
    }

    onSubmit = () => {
        this.props.submittedValues(this.state.department);
        this.props.handleNextButton();
    }

    onChange = (value) => {
        this.setState({department:value})
    };

    render(){
    return (
        this.state.done?
        <Form onFinish={this.onSubmit} validateMessages={validateMessages}>
            <Form.Item label="Departments" rules={[{ required: true }]} initialValue={this.props.department}>
            <Select
                showSearch
                style={{ width: 200 }}
                placeholder="Select a Department"
                onChange={this.onChange}
                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
                {this.state.data.length > 0 ?
                this.state.data.map(dep => 
                            <Option value={dep.department_id}>{dep.department_name}</Option>
                )
                :
                null
                }
            </Select>
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Next
                </Button>
            </Form.Item>
        </Form>
        :
        <Spin></Spin>
    );
}
}

export default TransferProjectSelectDepartment