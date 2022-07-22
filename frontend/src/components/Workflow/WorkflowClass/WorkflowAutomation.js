


import React, { Component, Fragment } from 'react'
import { Typography, Row, Collapse, Card, Space, Tooltip, Button } from 'antd';
import WorkflowCodeEditor from '../WorkflowCodeEditor';
import { DeleteFilled } from '@ant-design/icons';
import AutomationHookForm from './AutomationHookForm';
import { connect } from 'react-redux';


const { Text } = Typography;
const { Panel } = Collapse;


export class WorkflowAutomation extends Component {
  constructor(props) {
    super(props)

    this.state = {
      done: false,
      visible: false
    }
  }

  render() {
    return (
      <Fragment>
        {this.props.workflow.workflow.permissions['river.add_ontransithook'] &&
          this.props.workflow.workflow.permissions['river.add_onapprovedhook'] &&
          this.props.workflow.workflow.permissions['river.add_oncompletehook'] ?
          <Row justify="end">
            <Space>
              <Tooltip title="Add Automation">
                <AutomationHookForm />
              </Tooltip>
            </Space>
          </Row>
          :
          null}
        <Card type="inner">
          <Row justify="center" align="middle">
            <Text style={{ fontSize: '20px' }}>Automations assigned: </Text>
          </Row>
          {((this.props.workflow.transition_approval_hooks).length > 0) ?
            <Collapse accordion>
              {this.props.workflow.transition_approval_hooks.map(hook => (
                <Panel header={hook.callback_function.name} key={hook.id} >
                  {this.props.workflow.workflow.permissions['river.add_ontransithook'] &&
                    this.props.workflow.workflow.permissions['river.add_onapprovedhook'] &&
                    this.props.workflow.workflow.permissions['river.add_oncompletehook'] ?
                    <Row justify="end">
                      <Button type="danger" shape="circle" icon={<DeleteFilled />} onClick={() => this.props.deleteHook(hook.id)} style={{ float: "right" }} />
                    </Row>
                    :
                    null}
                  <WorkflowCodeEditor {...hook}
                    read_only={true} />
                </Panel>))}
            </Collapse>
            :
            <Row justify="center" align="middle" style={{ paddingTop: 30 }}>
              <Text style={{ fontSize: '15px' }}> Not Defined yet.. </Text>
            </Row>
          }
        </Card>
      </Fragment>
    )
  }
}
const mapStateToProps = (state) => {
  return {
    workflow: state.workflow.workflowclass,
  }
}


const mapDispatchToProps = dispatch => {
  return {
    deleteHook: (hook) => dispatch({ type: 'DELETE_TRANSITION_APPROVAL_HOOK', id: hook }),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(WorkflowAutomation);