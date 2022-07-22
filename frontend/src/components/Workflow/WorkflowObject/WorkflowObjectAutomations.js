import React, { Component, Fragment } from 'react'
import { Typography , Row , Collapse , Card } from 'antd';
import WorkflowCodeEditor from '../WorkflowCodeEditor';
import { connect } from 'react-redux';


const { Text } = Typography;
const { Panel } = Collapse;


export class WorkflowObjectAutomations extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
          done:false,
          visible: false
          }
       }

    render() {
            return (
                <Fragment>
                <Card type="inner">
                    <Row justify="center" align="middle">
                    <Text  style={{fontSize:'20px'}}>Automations assigned: </Text>
                    </Row>
                    {((this.props.workflowobject.transition_approval_hooks).length > 0) ?
                    <Collapse accordion>
                    {this.props.workflowobject.transition_approval_hooks.map(hook => (
                    <Panel header={hook.callback_function.name} key={hook.id} >
                    <WorkflowCodeEditor {...hook}
                     read_only = {true} />
                    </Panel>))}
                    </Collapse>
                    :
                    <Row justify="center" align="middle" style={{paddingTop:30}}>
                      <Text style={{fontSize:'15px'}}> Not Defined yet.. </Text>
                    </Row>
                    }            
               </Card>
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


export default connect(mapStateToProps, null)(WorkflowObjectAutomations);