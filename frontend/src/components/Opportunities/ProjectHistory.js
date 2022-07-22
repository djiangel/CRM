import React, { useState, useEffect } from 'react'
import { Modal, List, Avatar, Button, Drawer, Timeline, Tag, Popover } from 'antd';
import { FieldTimeOutlined, UserOutlined, MessageOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'

export default function ProjectHistory(props) {

    const [visible, setVisible] = useState(false);

    const dateFormat = require('dateformat');
    const mediaquery = useSelector(state => state.mediaquery.size);
    let xs = mediaquery === 'xs'

    const [sortedHistories, setHistory] = useState([]);

    useEffect(() => {
        let histories = props.history.concat(props.m2m)

        for (let i = 0; i < histories.length; i++) {
            let newDateTime = new Date(histories[i].datetime)
            histories[i].datetime = newDateTime
        }

        setHistory(histories.sort((a, b) => b.datetime - a.datetime))
    }, [])

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
                {history.m2m ?
                    <React.Fragment>
                        <p className='timeline-date'>{dateFormat(history.datetime, "mmmm dS, yyyy, h:MM:ss TT")}</p>
                        <div className='activity-text-flex'><Tag color='magenta'>{history.user}</Tag>
                            {history.customer_added.length > 0 &&
                                <React.Fragment>
                                    <div>added customer(s):</div><div className='activity-personnel-flex'>{history.customer_added.map((change) => (<span><Tag color='blue'>{change}</Tag></span>))}</div>
                                </React.Fragment>
                            }
                            {history.customer_removed.length > 0 &&
                                <React.Fragment>
                                    <div>removed customer(s):</div><div className='activity-personnel-flex'>{history.customer_removed.map((change) => (<span><Tag color='red'>{change}</Tag></span>))}</div>
                                </React.Fragment>
                            }
                            {history.user_added.length > 0 &&
                                <React.Fragment>
                                    <div>added user(s):</div><div className='activity-personnel-flex'>{history.user_added.map((change) => (<span><Tag color='green'>{change}</Tag></span>))}</div>
                                </React.Fragment>
                            }
                            {history.user_removed.length > 0 &&
                                <React.Fragment>
                                    <div>removed user(s):</div><div className='activity-personnel-flex'>{history.user_removed.map((change) => (<span><Tag color='yellow'>{change}</Tag></span>))}</div>
                                </React.Fragment>
                            }
                        </div>
                    </React.Fragment>
                    :
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
                }
            </div>
        )
    }

    return (
        <React.Fragment>
            <Button size='small' type='primary' className='details-history' onClick={() => setVisible(true)}>
                <FieldTimeOutlined /> History
        </Button>
            <Drawer
                title="History View"
                width={mediaquery === 'xs' ? '100%' : 720}
                visible={visible}
                onClose={() => setVisible(false)}
            >
                <Timeline>
                    {sortedHistories.map((history, index) => (
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
