import React, { Component, Fragment } from 'react'
import { } from '@ant-design/icons';
import { Typography, Row, Spin, Col, Result, Button } from 'antd';
import { connect } from 'react-redux';
import WorkflowIllustration from '../../components/Workflow/WorkflowClass/WorkflowIllustration';
import WorkflowEditor from '../../containers/Workflow/WorkflowClass/WorkflowEditor';
const { Title } = Typography;

export class WorkFlowDetailPage extends Component {

  constructor(props) {
    super(props)

    this.state = {
      workflow: null,
      initialized: false,
    }
  }
  componentDidMount() {
    this.props.initial()
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.id !== nextProps.match.params.id) {
      this.props.initial()
    }
  }

  render() {
    return (
      this.props.loading["workflowclass"] === false ?
        !this.props.workflowclass.error ?
          <Fragment>
            <Title>Workflow builder</Title>
            <Row gutter={24}>
              <Col className="gutter-row" span={12}>
                <WorkflowIllustration
                  workflow={this.props.workflowclass}
                  can_edit={true} />
              </Col>
              <Col className="gutter-row" span={12}>
                <WorkflowEditor />
              </Col>
            </Row>
          </Fragment>
          :
          <Result
            status={this.props.workflowclass.error.status}
            title={this.props.workflowclass.error.status}
            subTitle={this.props.workflowclass.error.message.detail}
            extra={<Button type="primary">Back Home</Button>}
          />
        :
        <div style={{ textAlign: 'center' }}><Spin size='large' /></div>
    )
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    initial: () => dispatch({ type: 'WORKFLOWCLASS_DETAIL', id: ownProps.match.params.id })
  }
}


const mapStateToProps = state => ({
  loading: state.loading.loading,
  loadingComponent: state.loading.loadingComponent,
  workflowclass: state.workflow.workflowclass,
});

export default connect(mapStateToProps, mapDispatchToProps)(WorkFlowDetailPage);
