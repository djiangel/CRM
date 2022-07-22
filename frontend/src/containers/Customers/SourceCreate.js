import React, { Component } from 'react'
import DynamicForm from '../../components/Application/DynamicForm';
import { Redirect } from 'react-router-dom';
import { Layout } from 'antd';
import { connect } from 'react-redux'
import axiosInstance from '../../api/axiosApi';

class CustomerCreate extends Component {

    state = {}

    onSubmit = (data) => {
        axiosInstance.post(`/lead-source/`, data)
            .then(response => {
                this.props.success()
                this.props.onSubmit()
            })
            .catch(error => {
                this.setState({ response: error.response.data })
            })
    };


    render() {
        return (
            <Layout style={{ background: '#fff', height: '100vh', padding: '3%' }}>
                <div>
                    <p><b>Source Create Form</b></p>
                </div>
                <br />
                <DynamicForm className="form"
                    model={[
                        { key: "source", label: "Source" },
                    ]}

                    addon={[]}

                    response={this.state.response}

                    onSubmit={(data) => { this.onSubmit(data) }}
                />
            </Layout>
        )
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        success: () => dispatch({ type: 'LEAD_SOURCE' })
    }
}


export default connect(null, mapDispatchToProps)(CustomerCreate);
