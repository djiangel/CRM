import React, { Component, Fragment } from 'react'
import { Space, Row, Typography, Button } from 'antd';
import { connect } from "react-redux";

const { Text } = Typography;

const { Title } = Typography;

class TicketDetail extends Component {

    state = {
        done: false
    }

    render() {
        return (

            <div className='ticket-detail-child'>
                <div className='ticket-detail-flex'>
                    <span>Name: <Button shape="round" type="primary">{this.props.ticket.name}</Button></span>
                    <span className='ticket-detail-email'>Email: {this.props.ticket.email ? <Text>{this.props.ticket.email}</Text> : <Text>Not available</Text>}</span>
                    <span className='ticket-detail-email'>Phone: {this.props.ticket.phone ? <Text>{this.props.ticket.phone}</Text> : <Text>Not available</Text>}</span>
                </div>
                <hr />
                <div className='ticket-detail-title'><Text strong underline>Ticket Details</Text></div>
                <div className='ticket-detail-grid'>
                    <Text>Ticket Source : {this.props.ticket.source}</Text>
                    <Text>Nature : {this.props.ticket.nature}</Text>
                    <Text>State : {this.props.ticket.ticket_status.label}</Text>
                    <Text>Priority : {this.props.ticket.priority}</Text>
                </div>
            </div>
        )
    }
}


const mapStateToProps = state => {
    return {
        ticket: state.ticket.ticket
    };
};


export default connect(mapStateToProps, null)(TicketDetail);

