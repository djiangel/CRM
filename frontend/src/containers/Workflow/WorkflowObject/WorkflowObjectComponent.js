import React, { Component, Fragment } from 'react'
import { } from '@ant-design/icons';
import { Typography, Row, Spin, Col, Drawer } from 'antd';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import WorkflowObjectEditor from './WorkflowObjectEditor';
import WorkflowObjectIllustration from '../../../components/Workflow/WorkflowObject/WorkflowObjectIllustration';

const { Title } = Typography;

class WorkflowObjectComponent extends Component {
  constructor(props) {
    super(props);
  }

  state = { visible: false };

  componentDidMount() {
    this.props.initial(this.props.workflow_class.id, this.props.match.params.id)
  }

  showDrawer = () => {
    this.setState({
      visible: true,
    });
  };


  onClose = () => {
    this.setState({
      visible: false,
    })
  };


  render() {
    return (
      this.props.loading["workflowobject"] === false ?
        <Fragment>
          <WorkflowObjectIllustration
            workflow={this.props.workflowobject}
            showDrawer={this.showDrawer} />
          <Drawer
            title="Workflow"
            placement="right"
            closable={true}
            onClose={this.onClose}
            visible={this.state.visible}
            width={600}
          >
            <WorkflowObjectEditor
              onClose={this.onClose}
            />
          </Drawer>
        </Fragment >
        :
        <div style={{ textAlign: 'center' }}><Spin size='large' /></div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    initial: (class_id, object_id) => dispatch({ type: 'WORKFLOWOBJECT_DETAIL', workflow_id: class_id, workflow_object_id: object_id }),
  }
}

const mapStateToProps = state => {
  return {
    loading: state.loading.loading,
    loadingComponent: state.loading.loadingComponent,
    workflowobject: state.workflow.workflowobject,
  };
};




export default withRouter(connect(mapStateToProps, mapDispatchToProps)(WorkflowObjectComponent));