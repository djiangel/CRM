import React, { Component, Fragment } from 'react'
import { Button, Typography, Row, Space } from 'antd';
import { connect } from "react-redux";
import TicketDrawer from './Form/TicketDrawer';
const { Text } = Typography;

class TicketCustomer extends Component {

    state = {
        done: false
    }

    render() {
        if (this.props.customerInformation) {
            return (
                <div className='ticket-customer-child'>
                    <Text strong underline> Existing Customer Infomation</Text>
                    {this.props.salesProject === null && this.props.permissions['sales.can_change_ticket_customer'] ?
                        <TicketDrawer
                            button_name='Edit Customer'
                            title='Edit your choice of customer'
                            component='ReassignCustomer' /> : null}
                    <div className='ticket-customer-grid'>
                        <Text>Customer ID: {this.props.customerInformation.customer_id}</Text>
                        <Text>Company: {this.props.customerInformation.customer_name}</Text>
                        <Text>Telephone: {this.props.customerInformation.telephone_number}</Text>
                        <Text>Inc Country: {this.props.customerInformation.country}</Text>
                        <Text>Status: {this.props.customerInformation.customer_status.label}</Text>
                    </div>
                </div>
            )
        } else {
            return (
                <Space direction="vertical">
                    <Text strong>Existing Customer Infomation</Text>
                    <Row>
                        <Text> There's no associated customer currently</Text>
                    </Row>
                    <Row>
                        <Space>
                            {this.props.permissions['sales.add_customerinformation'] ?
                                <Fragment>
                                    < TicketDrawer
                                        button_name='Create New Customer'
                                        title='Create and assign to a New Customer'
                                        component='AssignNewCustomer' /> or
                                </Fragment>
                                : null}
                            {this.props.permissions['sales.can_assign_ticket_customer'] ?
                                <TicketDrawer
                                    button_name='Assign Customer'
                                    title='Assign to an existing Customer'
                                    component='AssignExistingCustomer' />
                                : null}
                        </Space>
                    </Row>
                </Space>
            )
        }
    }
}


const mapStateToProps = state => {
    return {
        customerInformation: state.ticket.ticket.customerInformation,
        salesProject: state.ticket.ticket.salesProject,
        id: state.ticket.ticket.id,
        name: state.ticket.ticket.name,
        email: state.ticket.ticket.email,
        permissions: state.ticket.ticket.permissions
    };
};


export default connect(mapStateToProps, null)(TicketCustomer);

