


import React, { Component, Fragment } from 'react'
import { Typography, Button, Card, Space, Row } from 'antd';
import { connect } from 'react-redux';
const { Text } = Typography;

export class DragNDropApproval extends Component {
  constructor(props) {
    super(props)

    this.state = {
      visible: false,
    }
  }

  approve() {
    this.props.approve(this.props.workflowobject.workflow_id, this.props.workflowobject.object_identifier, this.props.workflowobject.selected_transition.destination_state_id, this.props.workflowobject.selected_transition.id)
    this.props.onClose()
  }

  passRoleTest() {
    const hello = this.props.workflowobject.transition_approvals.map((approval) => (
      approval.groups.some(obj => this.props.person.group.find(aObj => obj.id === aObj.id))
    ))
    if (hello.some(obj => obj === true)) {
      return true
    } else {
      return false
    }
  }



  render() {
    console.log(this.props.workflowobject.selected_transition.source_state_id, this.props.workflowobject.current_state.id,
      this.props.workflowobject.selected_transition.is_done === false,
      this.passRoleTest(),
      this.props.workflowobject.selected_transition.is_cancelled === false
    )
    return (
      <Fragment>
        {this.props.workflowobject.selected_transition.source_state_id === this.props.workflowobject.current_state.id &&
          this.props.workflowobject.selected_transition.is_done === false &&
          this.props.workflowobject.selected_transition.is_cancelled === false &&
          this.passRoleTest()
          ?
          <Row>
            <Button style={{ float: "right" }} type="primary" shape="round" onClick={() => this.approve()} style={{ float: "right" }}>Approve</Button>
          </Row>
          :
          null
        }
        {this.props.workflowobject.transition_approvals.map((item) => (
          <Card className={item.status === "approved" ? 'hoveritem-green' : "hoveritem"} key={item.id}>
            <Space>
              <Text>
                Priority : {item.priority + 1}
              </Text>
              {item.groups.map((group) => {
                return (
                  <Button shape="round" key={group.id}>{group.name}</Button>
                )
              })}
            </Space>
            <Row>
              <Text style={{ float: "right" }}>Status : {item.status}</Text>
            </Row>
            {item.status === "approved" ?
              <Row>
                <Text style={{ float: "right" }}>Transactioner : {item.transactioner.username}</Text>
              </Row>
              :
              null
            }
          </Card>
        ))}
      </Fragment>
    )
  }
}


const mapDispatchToProps = dispatch => {
  return {
    deleteApproval: (approval) => dispatch({ type: 'DELETE_TRANSITION_APPROVAL', id: approval }),
    reorderTransitions: (newapprovals) => dispatch({ type: 'REORDER_TRANSITION_APPROVALS', newApprovals: newapprovals }),
    approve: (class_id, object_id, next_state, transition) => dispatch({ type: 'APPROVE_TRANSITION_APPROVAL', workflow_id: class_id, workflow_object_id: object_id, next_state_id: next_state, transition_id: transition })
  }
}

const mapStateToProps = (state) => {
  return {
    person: state.auth,
    workflowobject: state.workflow.workflowobject,
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(DragNDropApproval);