import React, { useState, useEffect } from 'react'
import { Spin, Card, Result, Alert, Typography, Button, Empty, Tabs, Table, Descriptions, PageHeader, Timeline, Drawer, Avatar, Tag, Popover } from 'antd';
import { ShoppingCartOutlined, CoffeeOutlined, UserOutlined, MobileOutlined, PhoneOutlined, FireOutlined, HomeOutlined, CarOutlined, MessageOutlined, FullscreenOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import { PermissionsChecker } from '../../api/PermissionsChecker';
import SwipeableViews from 'react-swipeable-views';
import MoonLoader from "react-spinners/MoonLoader";
import './block.css'
import BudgetBlockDrawer from '../../components/BudgetBlock/Forms/BudgetBlockDrawer';
import WorkflowObjectComponent from '../Workflow/WorkflowObject/WorkflowObjectComponent';

const { TabPane } = Tabs;

export default function BudgetBlockDetail(props) {

    const dateFormat = require('dateformat');

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch({ type: 'BLOCK_DETAIL', id: props.match.params.id })

    }, [props.match.params.id])

    const block = useSelector(state => state.api.block);
    const loading = useSelector(state => state.loading.loading);
    const mediaquery = useSelector(state => state.mediaquery.size);
    let xs = mediaquery === 'xs'
    //jason add in workflow here pls thanks 
    const details = (block) => (
        <div className='details-col'>
            <PageHeader ghost={false} onBack={() => props.history.goBack()} title={`Budget Block ID: ${block.block_id}`}
                extra={
                    [block.permissions['sales.change_budgetblock'] && block.is_at_last_stage.last_stage === false ?
                        <BudgetBlockDrawer
                            data={block}
                            button_name='Edit Budget Block'
                            title='Edit Budget Block'
                            component='BudgetBlockUpdate'
                            button_type='update'
                            button_style='default' />
                        :
                        null
                    ]
                }>
                <div className='block-detail-grid'>
                    <div className='block-start'><HomeOutlined />Start Date: {block.start_date}</div>
                    <div className='block-end'><FireOutlined />End Date: {block.end_date}</div>
                    <div className='block-vendor'><MobileOutlined />Vendor: {block.vendor ? block.vendor.vendor_name : '-'}</div>
                    <div className='block-project'><PhoneOutlined />Project: {block.project ? block.project.sales_project_name : '-'}</div>
                    <div className='block-buy'><CarOutlined />Buy Price: {block.buy_price}</div>
                    <div className='block-sell'><ShoppingCartOutlined />Sell Price: {block.sell_price}</div>
                    <div className='block-item'><CoffeeOutlined />Item: {block.item.item_code}</div>
                </div>
            </PageHeader>
        </div>
    )

    const historyDetails = (history) => {
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

    const activities = (block) => (
        <Card title='Activities' className='activity-col'>
            {block.history.length ?
                <Timeline>
                    {block.history.map((history, index) => (
                        <Timeline.Item
                            dot={
                                history.profile_picture ?
                                    <Avatar src={history.profile_picture} />
                                    : <Avatar icon={<UserOutlined />} size='small' />}>
                            <div className='profile-picture-timeline'>
                                <p className='timeline-date'>{dateFormat(history.datetime, "mmmm dS, yyyy, h:MM:ss TT")}</p>
                                <p className='flex-horizontal-container'><div className='activity-text'><Tag color='magenta'>{history.user}</Tag>
                                    {`${history.changes.length ? 'edited' : 'created'} ${history.model === 'Sales Project' ? `this ${history.model}` : `${history.model} ID: ${history.id}`}`}
                                </div>
                                    {history.changes.length > 0 &&
                                        <React.Fragment>
                                            <Popover placement="topRight" content={() => historyDetails(history)} overlayStyle={xs ? { width: '75vw' } : null} key={`${index}h`}>
                                                <Button type='text' shape='circle' className='align-right' key={`${index}g`}><MessageOutlined /></Button>
                                            </Popover>
                                        </React.Fragment>
                                    }
                                </p>
                            </div>
                        </Timeline.Item>
                    ))}
                </Timeline>
                : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
        </Card>
    )

    const workflow = () => (
        <Card className='workflow-col' key='workflow' title='Workflow'>
            <WorkflowObjectComponent
                workflow_class={block.workflow_id}
            />
        </Card>
    )


    return (
        loading['block'] === false ?
            (!block.error ?
                <React.Fragment>
                    <div className='block-grid'>
                        <React.Fragment>
                            {details(block)}
                            {activities(block)}
                            {workflow()}
                        </React.Fragment>
                    </div>
                </React.Fragment>
                :
                <Result
                    status={block.error.status}
                    title={block.error.status}
                    subTitle={block.error.message.detail}
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
                    tip={`Pulling Budget Block ID: ${props.match.params.id}...`} />
            </div>
    )
}
