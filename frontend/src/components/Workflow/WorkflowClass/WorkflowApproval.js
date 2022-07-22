


import React, { Component, Fragment } from 'react'
import { Typography, Row } from 'antd';
import ApprovalHookForm from './ApprovalHookForm';
import DragNDropApproval from './DragNDropApproval';
import { connect } from 'react-redux'
import { PermissionsChecker } from '../../../api/PermissionsChecker';

const { Text } = Typography;


export class WorkflowApproval extends Component {
  constructor(props) {
    super(props)

    this.state = {
      done: false,
      visible: false,
    }
  }

  render() {
    return (
      <Fragment>
        <Row justify="end">
          {this.props.workflow.workflow.permissions['river.add_transitionapprovalmeta'] ?
            <ApprovalHookForm />
            :
            null}
        </Row>
        <Row justify="center" align="middle">
          <Text style={{ fontSize: '20px' }}>Approval List </Text>
        </Row>
        {this.props.workflow.transition_approvals.length > 0 ?
          <DragNDropApproval
            can_edit={this.props.can_edit}
            workflow={this.props.workflow}
            person={this.props.person} />
          :
          <Row align="middle" justify="center" style={{ paddingTop: 30 }}>
            <Text style={{ fontSize: '15px' }}>There's No approvals set for this workflow..</Text>
          </Row>
        }
      </Fragment>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    person: state.auth,
    workflow: state.workflow.workflowclass,
  }
}

export default connect(mapStateToProps, null)(WorkflowApproval);

