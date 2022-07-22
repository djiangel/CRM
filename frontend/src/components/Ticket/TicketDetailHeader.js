import React, { useState } from 'react'
import { Typography, Row, Descriptions, PageHeader } from 'antd';
import { useSelector } from 'react-redux'
import TicketDrawer from './Form/TicketDrawer';

const { Title } = Typography;
const { Text } = Typography;

export default function TicketDetailHeader() {
    const mediaquery = useSelector(state => state.mediaquery.size);
    let desktop = mediaquery === 'md' || mediaquery === 'lg' || mediaquery === 'sm';

    const ticket = useSelector(state => state.ticket.ticket)

    const [index, setIndex] = useState(0);

    const routes = [
        {
            path: '',
            breadcrumbName: 'Home'
        },
        {
            path: 'project/all',
            breadcrumbName: 'Project List'
        },
        {
            path: 'project/detail/1',
            breadcrumbName: 'Project Detail 1'
        }
    ]
    const dateconverter = (ServerDate) => {
        const dateFormat = require('dateformat');
        var date = new Date(ServerDate)
        var newdate = dateFormat(date, "mmmm dS, yyyy, h:MM:ss TT")
        return (newdate)
    }

    return (
        <PageHeader ghost={false} onBack={desktop ? () => null : null} title={ticket.title}>
            <div className='ticket-header-grid'>
                <div className='ticket-header-description'>Description: {ticket.content}{ticket.permissions['sales.change_ticket'] && ticket.source == 'others' ?
                    <TicketDrawer
                        button_name='Update Ticket'
                        title='Update ticket'
                        component='UpdateTicket'
                    /> : null}
                </div>
                <div className='ticket-header-created'>Date Created: {dateconverter(ticket.ticket_status.date_created)}</div>
                <div className='ticket-header-updated'>Date Updated: {dateconverter(ticket.ticket_status.date_updated)}</div>
            </div>
        </PageHeader>

    )
}
