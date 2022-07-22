


import React, { Component, Fragment } from 'react'
import { Typography , Row } from 'antd';
import WorkflowObjectApprovalList from './WorkflowObjectApprovalList';
import { connect } from 'react-redux';

const { Text } = Typography;


export class WorkflowApproval extends Component {
  constructor(props) {
    super(props)

    this.state = {
      done:false,
      visible: false,
      }
   }
   

    render() {
        return (
                <Fragment>
                    <Row justify="center" align="middle">
                    <Text  style={{fontSize:'20px'}}>Approval List </Text>
                    </Row>
                        {this.props.workflowobject.transition_approvals.length > 0 ? 
                        <WorkflowObjectApprovalList
                        onClose={this.props.onClose}/>
                          :
                        <Row align="middle" justify="center" style={{paddingTop:30}}>
                        <Text style={{fontSize:'15px'}}>There's No approvals set for this workflow..</Text>
                        </Row>                                      
                        }
               </Fragment>
            )
    }
}

const mapStateToProps = (state) => {
  return {
      person: state.auth,
      workflowobject:state.workflow.workflowobject,
      loading: state.loading.loading,
  }
}

export default connect(mapStateToProps, null)(WorkflowApproval);

