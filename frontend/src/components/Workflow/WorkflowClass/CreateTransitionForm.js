


import React, { Component } from 'react'
import { Spin } from 'antd';
import DynamicForm from '../../Application/DynamicForm';
import axiosInstance from '../../../api/axiosApi';
import { connect } from 'react-redux'



class CreateTransitionForm extends Component {
    state = {
        state_list: null,
        done: false,
    };

    apiGet() {
        var get_states =
            axiosInstance.get("/state/list/")
                .then(response => {
                    this.setState({ state_list: response.data })
                });
        Promise.all([get_states]).then(() => {
            this.setState({ done: true });
        }
        )
    }

    onSubmit = (data) => {
        data.workflow = this.props.workflow.workflow.id
        data.source_state = this.props.workflow.selected_state.id
        this.props.addTransition(data)
        this.props.submitHandler()
    };


    componentDidMount() {
        this.apiGet()
    }

    render() {
        if (this.state.done === true) {
            return (
                <DynamicForm className="form"
                    model={[
                        { key: "destination_state", label: "State", type: "fkey", options: this.state.state_list, id: "id", name: "label" }
                    ]}

                    addon={[]}

                    addonData={[]}

                    onSubmit={(data) => { this.onSubmit(data) }}
                />
            )

        } else {
            return (
                <div style={{ textAlign: 'center' }}><Spin size='large' /></div>
            )

        }
    }
}

const mapDispatchToProps = dispatch => {
    return {
        addTransition : (data , id) => dispatch({ type: 'CREATE_TRANSITION' , data:data})
    }
  }
  

const mapStateToProps = state => ({
    workflow: state.workflow.workflowclass
})

export default connect(mapStateToProps, mapDispatchToProps)(CreateTransitionForm);

