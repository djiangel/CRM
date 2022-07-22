import React, { Component } from 'react'
import {} from '@ant-design/icons';
import { Typography , Row , Spin } from 'antd';
import { connect } from 'react-redux';
import WorkflowClassCard from '../../components/Workflow/WorkflowClass/WorkflowClassCard';

const { Text } = Typography;

export class ListWorkflowObjectsPage extends Component {
    componentDidMount(){
        this.props.initial()
    }

    render() {
        return (
            this.props.loading['workflowclassesall'] === false?
            <div className="site-card-wrapper">
            <Row gutter={16}>
            {this.props.workflowclasses.map(flow => (<WorkflowClassCard {...flow} key={flow.id} />))}
            </Row>
            </div>
            :
            <div style={{ textAlign: 'center' }}><Spin size='large' /></div>
        )
    }
}

const mapDispatchToProps = dispatch => {
    return {
        initial: () => dispatch({ type: 'WORKFLOWCLASS_LIST' })
    }
  }

  
const mapStateToProps = state => {
    return {
        loading: state.loading.loading,
        workflowclasses: state.workflow.workflowclasses,
    };
};

export default connect(mapStateToProps,mapDispatchToProps)(ListWorkflowObjectsPage);