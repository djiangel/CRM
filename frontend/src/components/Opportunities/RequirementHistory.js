import React, { useState } from 'react'
import { Modal, List, Avatar, Button, Timeline, Popover, Drawer, Tag } from 'antd';
import { FieldTimeOutlined, UserOutlined, MessageOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'

export default function RequirementHistory(props) {

    const dateFormat = require('dateformat');

    const [visible, setVisible] = useState(false);
    const mediaquery = useSelector(state => state.mediaquery.size);
    let xs = mediaquery === 'xs'

    const details = (history) => {
        return (
            history.changes.map((change, number) => (
                <React.Fragment key={number + 'field'}>
                    {`Changed field '${change.field}' from '${change.old}' to '${change.new}'`}
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
                        {`${history.changes.length === 0 ? 'created' :
                            history.changes[0].field === 'status' ? history.changes[0].new === 'active' ? 'restored' : 'deleted' : 'edited'} 
                            this ${history.model}`}
                    </div>
                        {history.changes.length > 0 && history.changes[0].field !== 'status' &&
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


    return (
        <React.Fragment>
            <Button size='small' shape='circle' type="text" onClick={() => setVisible(true)}>
                <FieldTimeOutlined /> History
            </Button>
            <Drawer
                title="History View"
                width={mediaquery === 'xs' ? '100%' : 720}
                visible={visible}
                onClose={() => setVisible(false)}
            >
                <Timeline>
                    {props.history.map((history, index) => (
                        <Timeline.Item
                            key={dateFormat(history.datetime, "mmmm dS, yyyy, h:MM:ss TT")}
                            dot={
                                history.profile_picture ?
                                    <Avatar src={history.profile_picture} size='small' />
                                    : <Avatar icon={<UserOutlined />} size='small' />}>
                            {contentMobile(history, index)}
                        </Timeline.Item>
                    ))}
                </Timeline>
            </Drawer>
        </React.Fragment>
    )
}
