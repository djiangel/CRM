


import React, { Component, Fragment } from 'react'
import {UserOutlined, AndroidOutlined} from '@ant-design/icons';
import { Typography , Tabs , Row , Skeleton , Card , Button , Space } from 'antd';
import WorkflowObjectApproval from '../../../components/Workflow/WorkflowObject/WorkflowObjectApprovals';
import WorkflowObjectAutomations from '../../../components/Workflow/WorkflowObject/WorkflowObjectAutomations';
import { connect } from 'react-redux';

const { TabPane } = Tabs;

const { Text } = Typography;

export class WorkflowObjectEditor extends Component {
  constructor(props) {
    super(props)
      this.get_state_by = this.get_state_by.bind(this)
   }

    get_state_by(id) {
        return this.props.workflowobject.states.find(state => state.id == id).label;
    }

    render(){
        if (this.props.loading["workflowobject_select"] === false){
            return (
                <Fragment>
                    <Row justify="center" align="middle" >
                    <Space>
                    <Text style={{fontSize:'20px'}} >Transition steps from </Text>
                    <Button shape="round" type="primary">{this.get_state_by(this.props.workflowobject.selected_transition.source_state)}</Button>
                    <Text  style={{fontSize:'20px'}} > To </Text>
                    <Button shape="round" type="primary">{this.get_state_by(this.props.workflowobject.selected_transition.destination_state)}</Button>
                    </Space>
                    </Row>
                    <Tabs defaultActiveKey="1">
                    <TabPane
                    tab={
                        <span>
                        <UserOutlined />
                        Approvals
                        </span>
                    }
                    key="1"
                    >
                    <WorkflowObjectApproval
                    onClose={this.props.onClose}/>
                    </TabPane>
                    <TabPane
                    tab={
                        <span>
                        <AndroidOutlined />
                        Automations
                        </span>
                    }
                    key="2"
                    >
                    <WorkflowObjectAutomations/>
                    </TabPane>
                    </Tabs>
                    </Fragment>
                )
        }
        else{
            return(
                null
        )
    }
    }
}


const mapStateToProps = (state) => {
    return {
        person: state.auth,
        workflowobject:state.workflow.workflowobject,
        loading: state.loading.loading,
    }
  }
  

export default connect(mapStateToProps, null)(WorkflowObjectEditor);
