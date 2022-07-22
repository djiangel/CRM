


import React, { Component, Fragment } from 'react'
import { Typography, Row, Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Drawer } from 'antd';
import CreateTransitionForm from '../../../components/Workflow/WorkflowClass/CreateTransitionForm';
import { connect } from 'react-redux';

const { Text } = Typography;

export class WorkflowStates extends Component {
  constructor(props) {
    super(props)

    this.state = {
      done: false,
      approvals: [],
      visible: false
    }
    this.submitHandler = this.onClose.bind(this)
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


  render() {
    return (
      <Fragment>
        <Row justify="center" align="middle" >
          <Space>
            <Text style={{ fontSize: '20px' }} >Selected State: </Text>
            <Button shape="round" type="primary">{this.props.workflow.selected_state.slug}</Button>
          </Space>
        </Row>

        <Fragment>
          <Row align="middle" justify="center" style={{ paddingTop: 30 }}>
            <Text style={{ fontSize: '15px' }}>{this.props.workflow.selected_state.description ? this.props.workflow.selected_state.description : "No description available"}</Text>
          </Row>
          {this.props.workflow.workflow.permissions['river.add_transitionmeta'] ?
            <Row align="middle" justify="center" style={{ paddingTop: 30 }}>
              <Space>
                <Text style={{ fontSize: '15px' }}>Create a new transition from {this.props.workflow.selected_state.label}</Text>
                <Button type="success" shape="round" onClick={this.showDrawer}>
                  <PlusOutlined /> Transition
                      </Button>
              </Space>
            </Row>
            :
            null}
        </Fragment>
        <Drawer
          title="Add a transition"
          width={720}
          onClose={this.onClose}
          visible={this.state.visible}
          bodyStyle={{ paddingBottom: 80 }}
        >
          <CreateTransitionForm {...this.props}
            submitHandler={this.onClose} />
        </Drawer>
      </Fragment>
    )
  }
}



const mapStateToProps = (state) => {
  return {
    workflow: state.workflow.workflowclass,
    person: state.auth
  }
}


export default connect(mapStateToProps, null)(WorkflowStates);
