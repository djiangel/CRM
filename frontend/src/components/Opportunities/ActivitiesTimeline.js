import React, { useState, useEffect } from 'react'
import { Card, Tag, Empty, Avatar, Timeline, Popover, Button, Tooltip } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined, UserOutlined, MessageOutlined, MoreOutlined } from '@ant-design/icons';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import './timeline.css'
import { useDispatch, useSelector } from 'react-redux'

const _ = require("lodash");

function ActivitiesTimeline({ project }) {

    const mediaquery = useSelector(state => state.mediaquery.size);

    const [history, setHistory] = useState([]);

    let xs = mediaquery === 'xs';

    const dateFormat = require('dateformat');

    useEffect(() => {
        var forecastHistory = []
        for (let i = 0; i < project.forecasts.length; i++) {
            forecastHistory = forecastHistory.concat(project.forecasts[i].history)
        }

        var requirementsHistory = []
        for (let i = 0; i < project.requirements.length; i++) {
            requirementsHistory = requirementsHistory.concat(project.requirements[i].history)
        }

        var quotationsHistory = []
        for (let i = 0; i < project.quotations.length; i++) {
            let quotations = project.quotations[i].history.filter(history => history.project === project.sales_project_name)
            quotationsHistory = quotationsHistory.concat(quotations)
            for (let z = 0; z < project.quotations[i].items.length; z++) {
                quotationsHistory = quotationsHistory.concat(project.quotations[i].items[z].history)
            }
        }
        var unassignedQuotationsHistory = []
        for (let i = 0; i < project.unassigned_quotations.length; i++) {
            let quotations = project.unassigned_quotations[i].history.filter(history => history.project === project.sales_project_name)
            unassignedQuotationsHistory = unassignedQuotationsHistory.concat(quotations)
            for (let z = 0; z < project.unassigned_quotations[i].items.length; z++) {
                unassignedQuotationsHistory = unassignedQuotationsHistory.concat(project.unassigned_quotations[i].items[z].history)
            }
        }

        var blockHistory = []
        for (let i = 0; i < project.blocks.length; i++) {
            blockHistory = blockHistory.concat(project.blocks[i].history)
        }

        var histories = project.history.concat(forecastHistory).concat(requirementsHistory).concat(quotationsHistory).concat(blockHistory).concat(project.m2m).concat(unassignedQuotationsHistory)
        for (let i = 0; i < histories.length; i++) {
            let newDateTime = new Date(histories[i].datetime)
            histories[i].datetime = newDateTime
        }

        setHistory(histories.sort((a, b) => b.datetime - a.datetime))
    }, [project])

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

    const more = (content, index, color) => {
        let output = [];
        for (let i = index; i < content.length; i++) {
            output.push(<Tag color={color} className='flex-popover-tag-child'>{content[i]}</Tag>)
        }
        return <div className='flex-popover-tag-parent'>{output}</div>
    }

    const tagItems = (change, index, entire, title, color) => {
        return (
            index === 5 ?
                <Popover content={more(entire, index, color)} title={title}>
                    <Button className='align-right'><MoreOutlined /></Button>
                </Popover>
                :
                index > 5 ?
                    null
                    :
                    <Tooltip title={change}>
                        <Tag color={color} key={index} className='project-m2m-items'>{change}</Tag>
                    </Tooltip>
        )
    }

    const contentMobile = (history, index) => {
        return (
            <div className='profile-picture-timeline' key={`${index}a`}>
                {history.m2m ?
                    <React.Fragment key={`${index}j`}>
                        <div className='timeline-date' key={`${index}b`}>{dateFormat(history.datetime, "mmmm dS, yyyy, h:MM:ss TT")}</div>
                        <div className='activity-text-flex' key={`${index}c`}><Tag color='magenta'>{history.user}</Tag>
                            {history.customer_added.length > 0 &&
                                <React.Fragment>
                                    <div>added customer(s):</div><div className='activity-personnel-flex'>
                                        {history.customer_added.map((change, index) => {
                                            return tagItems(change, index, history.customer_added, 'Customers Added', 'blue')
                                        })}
                                    </div>
                                </React.Fragment>
                            }
                            {history.customer_removed.length > 0 &&
                                <React.Fragment>
                                    <div>removed customer(s):</div><div className='activity-personnel-flex'>
                                        {history.customer_removed.map((change, index) => {
                                            return tagItems(change, index, history.customer_removed, 'Customers Removed', 'red')
                                        })}
                                    </div>
                                </React.Fragment>
                            }
                            {history.user_added.length > 0 &&
                                <React.Fragment>
                                    <div>added user(s):</div><div className='activity-personnel-flex'>
                                        {history.user_added.map((change, index) => {
                                            return tagItems(change, index, history.user_added, 'Users Added', 'blue')
                                        })}
                                    </div>
                                </React.Fragment>
                            }
                            {history.user_removed.length > 0 &&
                                <React.Fragment>
                                    <div>removed user(s):</div><div className='activity-personnel-flex'>
                                        {history.user_removed.map((change, index) => {
                                            return tagItems(change, index, history.user_removed, 'Users Removed', 'red')
                                        })}
                                    </div>
                                </React.Fragment>
                            }
                        </div>
                    </React.Fragment>
                    :
                    <React.Fragment key={`${index}i`}>
                        <div className='timeline-date' key={`${index}d`}>{dateFormat(history.datetime, "mmmm dS, yyyy, h:MM:ss TT")}</div>
                        <div className='flex-horizontal-container' key={`${index}e`}><div className='activity-text'><Tag color='magenta'>{history.user}</Tag>
                            {`${history.changes.length === 0 ? history.model === 'Quotation Item' ? 'added items to' : 'created' :
                                history.changes[0].field === 'status' ? history.changes[0].new === 'active' ? 'restored' : 'deleted'
                                    : history.model === 'Quotation' && history.changes[0].field === 'salesProject' ? history.changes[0].new === 'None' ? 'unassigned' : 'assigned'
                                        : history.model === 'Quotation Item' ? 'edited items in'
                                            : 'edited'}  
                         ${history.model === 'Sales Project' ? `this ${history.model}` :
                                    history.model === 'Quotation Item' ? `Quotation ID: ${history.quotation}` :
                                        `${history.model} ID: ${history.id}`}`}
                        </div>
                            {(history.model === 'Quotation Item' || (history.changes.length > 0 && history.changes[0].field !== 'status')) &&
                                <React.Fragment key={`${index}f`}>
                                    <Popover placement="topRight" content={() => details(history)} overlayStyle={xs ? { width: '75vw' } : null} key={`${index}h`}>
                                        <Button type='text' shape='circle' className='align-right' key={`${index}g`}><MessageOutlined /></Button>
                                    </Popover>
                                </React.Fragment>
                            }
                        </div>
                    </React.Fragment>
                }
            </div>
        )
    }

    console.log('rerendereddddddddddddddddddddddddd')

    return (
        history.length ?
            <Timeline>
                {history.map((history, index) => (
                    <Timeline.Item
                        key={index + 'timeline-item'}
                        dot={
                            history.profile_picture ?
                                <Avatar src={history.profile_picture} key={`${index}profile`} />
                                : <Avatar icon={<UserOutlined />} size='small' key={`${index}empty`} />}>
                        {contentMobile(history, index)}
                    </Timeline.Item>
                ))}
            </Timeline>
            : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
    )
}

export default React.memo(ActivitiesTimeline,
    (prevProps, nextProps) => {
        return _.isEqual(prevProps, nextProps)
    })



/*                         <Timeline.Item
                            dot={
                                history.profile_picture ?
                                    <div style={{ borderStyle: 'solid', borderRadius: '50%', borderWidth: '2px' }}>
                                        <Avatar src={history.profile_picture} size='large' />
                                    </div>
                                    : <Avatar icon={<UserOutlined />} size='large' />}>

*/

/*

                    <div style={{ overflow: 'auto', height: '80vh' }}>
                        <VerticalTimeline layout='1-column'>
                            {sortedHistories.map((history, index) => (
                                <VerticalTimelineElement
                                    className="vertical-timeline-element--work"
                                    contentStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
                                    contentArrowStyle={{ borderRight: '7px solid rgb(33, 150, 243)' }}
                                    iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
                                    key={index}
                                    icon={
                                        history.profile_picture ?
                                            <div style={{ borderStyle: 'solid', borderRadius: '50%', borderWidth: '2px' }}>
                                                <Avatar src={history.profile_picture} size='large' />
                                            </div>
                                            : <Avatar icon={<UserOutlined />} size='large' />}>
                                    {content(history, index)}
                                </VerticalTimelineElement>
                            ))}
                        </VerticalTimeline>
                    </div>

*/