import React, { useState, useEffect } from 'react'
import { Row, Layout, Result, Card, Spin, Timeline, Avatar, Button, Popover, Tag, Tabs, Typography, Alert } from 'antd';
import { UserOutlined, MessageOutlined } from '@ant-design/icons';
import { connect } from "react-redux";
import TicketDetail from '../../components/Ticket/TicketDetail';
import TicketCustomer from '../../components/Ticket/TicketCustomer';
import TicketProject from '../../components/Ticket/TicketProject';
import TicketDetailHeader from '../../components/Ticket/TicketDetailHeader';
import TicketBodyContainer from '../../containers/Ticket/TicketBodyContainer';
import TicketConversation from '../../components/Ticket/TicketConversation';
import { useDispatch, useSelector } from 'react-redux'
import SwipeableViews from 'react-swipeable-views';
import TabsUI from '@material-ui/core/Tabs';
import TabUI from '@material-ui/core/Tab';
import MoonLoader from "react-spinners/MoonLoader";

const { TabPane } = Tabs
const { Text } = Typography
export default function TicketDetailPage(props) {

    const dateFormat = require('dateformat');

    const dispatch = useDispatch()

    const ticket = useSelector(state => state.ticket.ticket)
    const loading = useSelector(state => state.loading.loading)
    const mediaquery = useSelector(state => state.mediaquery.size);
    let xs = mediaquery === 'xs'

    const [index, setIndex] = useState(0);

    useEffect(() => {
        dispatch({ type: 'TICKET_DETAIL', id: props.match.params.id })

    }, [props.match.params.id])

    const details = (history) => {
        return (
            history.changes.map((change, number) => (
                <React.Fragment key={number + 'field'}>
                    {(change.field === 'status') ? ((change.new === 'active') ? `Restored` : 'Deleted')
                        :
                        `Changed field '${change.field}' from '${change.old}' to '${change.new}'`}
                    <br />
                </React.Fragment>

            ))
        )
    }

    const contentMobile = (history, index) => {
        return (
            <div className='profile-picture-timeline'>
                <React.Fragment>
                    <p className='timeline-date'>{dateFormat(history.datetime, "mmmm dS, yyyy, h:MM:ss TT")}</p>
                    <p className='flex-horizontal-container'><div className='activity-text'><Tag color='magenta'>{history.user}</Tag>
                        {`${history.changes.length ? 'edited Ticket' : 'created Ticket'}`}
                    </div>
                        {history.changes.length > 0 &&
                            <React.Fragment>
                                <Popover placement="topRight" content={() => details(history)} overlayStyle={xs ? { width: '75vw' } : null} key={`${index}h`}>
                                    <Button type='text' shape='circle' className='align-right' key={`${index}g`}><MessageOutlined /></Button>
                                </Popover>
                            </React.Fragment>
                        }
                    </p>
                </React.Fragment>
            </div>
        )
    }

    const detail = () => (
        <Card className='detail-col' title='Ticket Details'>
            <TicketDetail />
            <hr />
            <TicketProject />
            <hr />
            <TicketCustomer />
        </Card>
    )

    const conversations = () => (
        <Card className='conversations-col'>
            {ticket.email
                ? <TicketConversation />
                : <Alert
                    message="POC has no email registered in our system. Please update the POC information."
                    type="warning" />
            }
        </Card>
    )

    const activities = () => (
        <Card className='activities-col' title='Activities'>
            <Timeline>
                {ticket.history.map((history, index) => (
                    <Timeline.Item
                        dot={
                            history.profile_picture ?
                                <Avatar src={history.profile_picture} />
                                : <Avatar icon={<UserOutlined />} size='small' />}>
                        {contentMobile(history, index)}
                    </Timeline.Item>
                ))}
            </Timeline>
        </Card>
    )


    return (
        loading["ticket"] === false ?
            (!ticket.error ?
                <div className='ticket-grid'>
                    <div className='header-col'>
                        <TicketDetailHeader />
                    </div>

                    {mediaquery === 'xs' ?
                        <div className='tabs-col'>
                            <Tabs onChange={(value) => setIndex(parseInt(value))}
                                activeKey={index.toString()}>
                                <TabPane tab="Details" key={0} />
                                <TabPane tab="Conversations" key={1} />
                                <TabPane tab="Activities" key={2} />
                            </Tabs>

                            <SwipeableViews enableMouseEvents index={index} onChangeIndex={(value) => setIndex(value)} animateHeight={true}>
                                {detail()}
                                {conversations()}
                                {activities()}
                            </SwipeableViews>
                        </div>
                        :

                        <React.Fragment>
                            {detail()}
                            {conversations()}
                            {activities()}
                        </React.Fragment>
                    }



                </div>
                :
                <Result
                    status={ticket.error.status}
                    title={ticket.error.status}
                    subTitle={ticket.error.message.detail}
                    extra={<Button type="primary">Back Home</Button>}
                />
            )
            :
            <div style={{ textAlign: "center", marginTop: '10%' }}>
                <Spin indicator={<MoonLoader
                    size={100}
                    color={"#1890ff"}
                    loading={true}
                />}
                    tip={`Retrieving Ticket ID: ${props.match.params.id}`} />
            </div>

    )
}
