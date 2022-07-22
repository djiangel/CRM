import React, { Component, Fragment } from 'react'
import { Row, Button, Space, Typography } from 'antd';
import { connect } from "react-redux";
import TicketDrawer from './Form/TicketDrawer';


const { Text } = Typography;

class TicketProject extends Component {

    state = {
        done: false
    }
    render() {
        if (this.props.ticket.salesProject) {
            return (
                <div className='ticket-project-child'>
                    <Text strong underline>Associated Project</Text>
                    {this.props.ticket.salesProject !== null && this.props.ticket.permissions['sales.can_change_ticket_project'] ?
                        <TicketDrawer
                            button_name='Reassign Project'
                            title='Assign to a different project'
                            component='ReassignProject' />
                        : null}
                    <div className='ticket-project-grid'>
                        <Text>Project ID: {this.props.ticket.salesProject.sales_project_id}</Text>
                        <Text>Project Name: {this.props.ticket.salesProject.sales_project_name}</Text>
                        <Text>Project Status: {this.props.ticket.salesProject.project_status.label}</Text>
                    </div>
                </div>
            )
        }
        if (this.props.ticket.customerInformation && this.props.ticket.salesProject == null) {
            return (
                <Space direction="vertical">
                    <Text strong>Associated Project</Text>
                    <Row>
                        <Text> There's no associated project currently</Text>
                    </Row>
                    <Row>
                        <Space>
                            {this.props.ticket.permissions['sales.add_salesproject'] ?
                                <Fragment>
                                    <TicketDrawer
                                        button_name='Create New Project'
                                        title='Create New Project'
                                        component='AssignNewProject' />  or </Fragment>
                                : null}
                            {this.props.ticket.permissions['sales.can_assign_ticket_project'] ?
                                <TicketDrawer
                                    button_name='Assign Existing Project'
                                    title='Assign to an existing project'
                                    component='AssignExistingProject' />
                                : null}
                        </Space>
                    </Row>
                </Space>
            )
        } else {
            return (
                <Space direction="vertical">
                    <Text strong>Associated Project</Text>
                    <Row>
                        <Text> There's no associated project currently.
                        Please create or Assign the ticket to a new or existing Customer respectively first.
                        </Text>
                    </Row>
                </Space>
            )
        }
    }
}


const mapStateToProps = state => {
    return {
        ticket: state.ticket.ticket
    };
};


export default connect(mapStateToProps, null)(TicketProject);

