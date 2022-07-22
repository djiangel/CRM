import React from 'react'
import { Card, Tag, Empty, Avatar, Timeline, Popover, Button, Tooltip } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined, UserOutlined, MessageOutlined, MoreOutlined } from '@ant-design/icons';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { useDispatch, useSelector } from 'react-redux'


export default function VendorActivities({ vendor }) {

    const mediaquery = useSelector(state => state.mediaquery.size);
    let xs = mediaquery === 'xs';

    const dateFormat = require('dateformat');

    var pocsHistory = []
    for (let i = 0; i < vendor.pocs.length; i++) {
        pocsHistory = pocsHistory.concat(vendor.pocs[i].history)
    }
    var histories = vendor.history.concat(pocsHistory)
    for (let i = 0; i < histories.length; i++) {
        let newDateTime = new Date(histories[i].datetime)
        histories[i].datetime = newDateTime
    }

    const sortedHistories = histories.sort((a, b) => b.datetime - a.datetime)

    const details = (history) => {
        return (
            <React.Fragment>
                {history.changes.map((change, number) => (
                    <React.Fragment key={number + 'field'}>
                        {`Changed field '${change.field}' from '${change.old}' to '${change.new}'`}
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
                    <p className='timeline-date'>{dateFormat(history.datetime, "mmmm dS, yyyy, h:MM:ss TT")}</p>
                    <p className='flex-horizontal-container'><div className='activity-text'><Tag color='magenta'>{history.user}</Tag>
                        {`${history.changes.length === 0 ? 'created' :
                            history.changes[0].field === 'status' ? history.changes[0].new === 'active' ? 'restored' : 'deleted' : 'edited'}  
                         ${history.model === 'Vendor' ? `this ${history.model}` : `${history.model} ID: ${history.id}`}`}
                    </div>
                        {(history.changes.length > 0 && history.changes[0].field !== 'status') &&
                            <React.Fragment>
                                <Popover placement="topRight" content={() => details(history)} overlayStyle={xs ? { width: '75vw' } : null}>
                                    <Button type='text' shape='circle' className='align-right'><MessageOutlined /></Button>
                                </Popover>
                            </React.Fragment>
                        }
                    </p>
                </React.Fragment>
            </div>
        )
    }

    return (
        sortedHistories.length ?
            <Timeline>
                {sortedHistories.map((history, index) => (
                    <Timeline.Item
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
