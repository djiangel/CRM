import React from 'react'
import { Card, Tag, Empty, Avatar, Timeline, Popover, Button, Tooltip } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined, UserOutlined, MessageOutlined, MoreOutlined } from '@ant-design/icons';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { useDispatch, useSelector } from 'react-redux'


export default function CustomerActivities({ customer }) {

    const mediaquery = useSelector(state => state.mediaquery.size);
    let xs = mediaquery === 'xs';

    const dateFormat = require('dateformat');

    var quotationsHistory = []
    let quotations = customer.quotations.filter(quotation => quotation.direction === 'sq').filter(quotation => quotation.salesProject === null)
    for (let i = 0; i < quotations.length; i++) {
        quotationsHistory = quotationsHistory.concat(quotations[i].history)
        for (let z = 0; z < quotations[i].items.length; z++) {
            quotationsHistory = quotationsHistory.concat(quotations[i].items[z].history)
        }
    }

    var pocsHistory = []
    for (let i = 0; i < customer.pocs.length; i++) {
        pocsHistory = pocsHistory.concat(customer.pocs[i].history)
    }

    var histories = customer.history.concat(quotationsHistory).concat(pocsHistory)
    for (let i = 0; i < histories.length; i++) {
        let newDateTime = new Date(histories[i].datetime)
        histories[i].datetime = newDateTime
    }
    const sortedHistories = histories.sort((a, b) => b.datetime - a.datetime)

    const details = (history) => {
        return (
            <React.Fragment>
                {history.model === 'Quotation Item' ? history.changes.length === 0 ? `Created Quotation Item ID: ${history.id}`
                    : `Edited Quotation Item ID: ${history.id}` : null}
                {history.model === 'Quotation Item' && <br />}
                {history.changes.map((change, number) => (
                    <React.Fragment key={number + 'field'}>
                        {change.field === 'salesProject' && change.old === 'None' ? `to '${change.new}'`
                            : change.field === 'salesProject' && change.new === 'None' ? `from '${change.old}'`
                                : `Changed field '${change.field}' from '${change.old}' to '${change.new}'`}
                        <br />
                    </React.Fragment>
                ))}
            </React.Fragment>
        )
    }

    const contentMobile = (history, index) => {
        return (
            <div className='profile-picture-timeline'>
                <React.Fragment>
                    <div className='timeline-date'>{dateFormat(history.datetime, "mmmm dS, yyyy, h:MM:ss TT")}</div>
                    <div className='flex-horizontal-container'><div className='activity-text'><Tag color='magenta'>{history.user}</Tag>
                        {`${history.changes.length === 0 ? history.model === 'Quotation Item' ? 'added items to' : 'created' :
                            history.changes[0].field === 'status' ? history.changes[0].new === 'active' ? 'restored' : 'deleted'
                                : history.model === 'Quotation' && history.changes[0].field === 'salesProject' ? history.changes[0].new === 'None' ? 'unassigned' : 'assigned'
                                    : history.model === 'Quotation Item' ? 'edited items in' : 'edited'}  
                         ${history.model === 'Customer' ? `this ${history.model}` :
                                history.model === 'Quotation Item' ? `Quotation ID: ${history.quotation}` :
                                    `${history.model} ID: ${history.id}`}`}
                    </div>
                        {(history.model === 'Quotation Item' || (history.changes.length > 0 && history.changes[0].field !== 'status')) &&
                            <React.Fragment>
                                <Popover placement="topRight" content={() => details(history)} overlayStyle={xs ? { width: '75vw' } : null}>
                                    <Button type='text' shape='circle' className='align-right'><MessageOutlined /></Button>
                                </Popover>
                            </React.Fragment>
                        }
                    </div>
                </React.Fragment>
            </div>
        )
    }

    return (
        sortedHistories.length ?
            <Timeline>
                {sortedHistories.map((history, index) => (
                    <Timeline.Item
                        key={index + 'timeline-item'}
                        dot={
                            history.profile_picture ?
                                <Avatar src={history.profile_picture} />
                                : <Avatar icon={<UserOutlined />} size='small' />}>
                        {contentMobile(history, index)}
                    </Timeline.Item>
                ))}
            </Timeline>
            : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
    )
}
