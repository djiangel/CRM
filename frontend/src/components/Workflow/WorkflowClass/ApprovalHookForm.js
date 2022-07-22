


import React, { Component, Fragment } from 'react'
import { Spin , Space , Tooltip , Button , Drawer} from 'antd';
import {PlusOutlined} from '@ant-design/icons';
import DynamicForm from '../../Application/DynamicForm';
import axiosInstance from '../../../api/axiosApi';
import { connect } from 'react-redux';


export class ApprovalHookForm extends Component {
    constructor(props) {
        super(props)
        this.state = {
            permission_list: null,
            group_list: null,
            done: false,
            approvals:[],
            visible: false,
            }
        this.onClose = this.onClose.bind(this)
        }

    
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

    apiGet(){
        var  get_permissions =  
        axiosInstance.get('/permission/list/')
            .then(response => {
                this.setState({ permission_list: response.data })
            });

        var  get_groups =  
        axiosInstance.get('/group/list/')
        .then(response => {
            this.setState({ group_list: response.data })
        });

        Promise.all([get_permissions, get_groups ]).then(() => {
              this.setState({ done : true });
              }
        )
    }

    onSubmit = (data) => {
        var max_priority = this.props.workflow.transition_approvals.reduce((max, approval) => Math.max(max, approval.priority), 0);
        data.priority = max_priority + 1;
        data.transition_meta = this.props.workflow.selected_transition.id
        data.workflow = this.props.workflow.workflow.id
        this.props.addTransitionApproval(data)
        this.onClose()
    };


    componentDidMount(){
        this.apiGet()
    }

    render() {
        if (this.state.done === true){
            return (
                <Fragment>
                <Space>
                <Tooltip title="Edit Approvers">
                 <Button type="success" shape="round" onClick={this.showDrawer}>
                    <PlusOutlined /> Approvers
                </Button>
                </Tooltip>
                </Space>
                
               <Drawer
               title="Add an Approver"
               width={720}
               onClose={this.onClose}
               visible={this.state.visible}
               bodyStyle={{ paddingBottom: 80 }}
               >
                <DynamicForm className="form"
                    model={[
                        { key: "groups", label: "Groups" ,  type: "m2m" , options: this.state.group_list , id : "id" , name: "name" , required:true }
                    ]}
 
                    addon={[]}

                    addonData={[]}

                    onSubmit={(data) => { this.onSubmit(data) }}
                />
               </Drawer>
               </Fragment>
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
        addTransitionApproval : (data) => dispatch({ type: 'CREATE_TRANSITION_APPROVAL' , data:data})
    }
  }
  
  const mapStateToProps = (state) => {
    return {
        workflow: state.workflow.workflowclass,
    }
  }
  
  
export default connect(mapStateToProps, mapDispatchToProps)(ApprovalHookForm);

