import React, { Component, Fragment } from 'react'
import { Typography , Row , Spin ,List, Card } from 'antd';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import CreateFunctionForm from '../../components/Workflow/WorkflowFunction/CreateFunctionForm';
import {PermissionsChecker} from '../../api/PermissionsChecker';
const { Text } = Typography;

export class ListFunctionPage extends Component {
    state = {
      initialized: false,
    }

    componentDidMount(){
        this.props.initial()
    }
    
    dateconverter = (ServerDate) => {
      const dateFormat = require('dateformat');
      var date = new Date(ServerDate)
      var newdate = dateFormat(date, "mmmm dS, yyyy, h:MM:ss TT")
      return(newdate)
  }

    render() {
        return (
            this.props.loading['automationlist'] === false?
            <Fragment>
            <Row justify="end">
            {PermissionsChecker(this.props.person.group,['add_function'] )?
              <CreateFunctionForm/>
              :
              null}
            
            </Row>
            <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 2,
              md: 4,
              lg: 4,
              xl: 6,
              xxl: 3,
            }}
            dataSource={this.props.automationlist}
            renderItem={item => (
              <List.Item>
              <Link to={`/workflow/automations/${item.id}`}>
                <Card title={item.name} className="hoveritem hoverable" justify="center" align="middle">
                <Row>
                <Text>Version: {item.version}</Text>
                </Row>
                <Row>
                <Text>Date Created: {this.dateconverter(item.date_created)}</Text>
                </Row>
                <Row>
                <Text>Date Updated: {this.dateconverter(item.date_updated)}</Text>
                </Row>               
                </Card>
              </Link>
              </List.Item>
              
            )}
          />
          </Fragment>
            :
            <div style={{ textAlign: 'center' }}><Spin size='large' /></div>
        )
    }
}

const mapDispatchToProps = dispatch => {
  return {
    initial: () => dispatch({ type: 'AUTOMATION_LIST' }),
  }
}

const mapStateToProps = state => {
  return {
    loading: state.loading.loading,
    loadingComponent: state.loading.loadingComponent,
    automationlist: state.workflow.automationlist,
    person : state.auth
  };
};




export default connect(mapStateToProps, mapDispatchToProps)(ListFunctionPage);


