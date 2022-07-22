import React, { useState } from 'react'
import { Tag, Empty, Card, Timeline, Button, Popover, Menu, Dropdown, Tabs, Skeleton } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined, FileImageOutlined, MoreOutlined, ScissorOutlined, FolderAddOutlined } from '@ant-design/icons';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import './timeline.css'
import CalendarDrawer from './../Calendar/Form/CalendarDrawer';
import OpportunityDrawer from './Forms/OpportunityDrawer';
import QuotationHistory from './QuotationHistory';
import QuotationItemList from './QuotationItemList';
import MUIDataTable from "mui-datatables";
import { useDispatch, useSelector } from 'react-redux'

const { TabPane } = Tabs;

const _ = require('lodash');


function QuotationTimeline({ quotations }) {

    const permissions = useSelector(state => state.api.project.permissions, (prevProps, nextProps) => { console.log(_.isEqual(prevProps, nextProps)); return _.isEqual(prevProps, nextProps) });
    const datatable = useSelector(state => state.mediaquery.datatable);

    const actions = (quotation) => (
        <Menu>
            {permissions['sales.change_quotation'] ?
                <Menu.Item><OpportunityDrawer data={quotation}
                    button_name='Edit Quotation'
                    title='Edit Quotation'
                    component='QuotationUpdate'
                    button_type='update' />
                </Menu.Item>
                : null
            }
            {permissions['sales.delete_quotation'] ?
                <Menu.Item>
                    <OpportunityDrawer data={quotation.quotation_id}
                        button_name='Delete Quotation'
                        title='Delete Quotation'
                        component='QuotationDelete'
                        button_type='delete' />
                </Menu.Item>
                : null
            }
            {quotation.file ?
                <Menu.Item>
                    <Button type="text" shape="circle" size="small"><a href={quotation.file}><FileImageOutlined /></a></Button> File
                </Menu.Item>
                : null}
            <Menu.Item><QuotationHistory history={quotation.history} /></Menu.Item>
            {permissions['sales.add_tasks'] ?
                <Menu.Item>
                    <CalendarDrawer
                        button_name='Create Reminder'
                        title='When Shall we remind you?'
                        component='CreateReminder'
                        task_title={`Reminder [Quotation ID: ${quotation.quotation_id}]`}
                        content={`Please remember to follow up on Requirement [${quotation.quotation_id}]`}
                    />
                </Menu.Item>
                : null
            }
        </Menu>
    )

    const columns = [
        {
            name: "quotation_id",
            label: "ID",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "due_date",
            label: "Due Date",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "remarks",
            label: "Remarks",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "quotation_id",
            label: "Items",
            options: {
                filter: false,
                sort: false,
                customBodyRender: (value, tableMeta) => {
                    return <QuotationItemList quotation={quotations.find(quotation => quotation.quotation_id === value)} />
                }
            }
        },
        {
            name: "quotation_id",
            label: "Options",
            options: {
                filter: false,
                sort: false,
                customBodyRender: (value, tableMeta) => {
                    return (
                        <Dropdown placement="bottomRight" overlay={() => actions(quotations.find(quotation => quotation.quotation_id === value))}>
                            <Button size='small' type='text'><MoreOutlined /></Button>
                        </Dropdown>
                    )
                }
            }
        },
    ];

    const options = {
        filterType: 'checkbox',
        selectableRowsHeader: false,
        selectableRows: "none",
        download: false,
        print: false,
        rowsPerPage: datatable ? 5 : 10,
        rowsPerPageOptions: datatable ? [5] : [10],
    }

    console.log('rerender')

    return (
        <MUIDataTable
            data={quotations}
            columns={columns}
            options={options}
        />
    )
}

export default React.memo(QuotationTimeline,
    (prevProps, nextProps) => {
        console.log(_.isEqual(prevProps, nextProps))
        return _.isEqual(prevProps, nextProps);
    })


/*   //jason add back assign      customToolbar: () => (<OpportunityDrawer
            button_name='Assign Quotation'
            title='Assign Quotation'
            component='QuotationAssign'
            button_type={<FolderAddOutlined />}
            button_style='default' />),

            */

/* jason add back unassign
<Menu.Item><OpportunityDrawer data={quotation.quotation_id}
button_name='Unassign'
title='Unassign Quotation'
component='QuotationUnassign'
button_type={<ScissorOutlined />} /></Menu.Item> */

/*

    const details = (quotation) => (
        <p>
            {quotation.details}
        </p>
    )

    const actions = (quotation) => (
        <Menu>
            <Menu.Item><QuotationUpdateDrawer id={quotation.quotation_id} /> Edit</Menu.Item>
            <Menu.Item><QuotationDelete id={quotation.quotation_id} /> Delete</Menu.Item>
            {quotation.file ?
                <Menu.Item>
                    <Button type="text" shape="circle" size="small"><a href={quotation.file}><FileImageOutlined /></a></Button> File
                </Menu.Item>
                : null}
            <Menu.Item><QuotationHistory history={quotation.history} /> History</Menu.Item>
        </Menu>
    )

    return (

quotations.length ?
            <Timeline>
                {quotations.map(quotation => (
                    <Timeline.Item color={quotation.decision === 'approved' ? 'green' : quotation.decision === 'rejected' ? 'red' : 'blue'}>
                        <div className={quotation.direction == 'pq' ? 'quotation-grid pq-grid' : 'quotation-grid sq-grid'}>
                            <p className='quotation-date flex-horizontal-container timeline-date'>{dateFormat(quotation.date_time, "mmmm dS, yyyy, h:MM:ss TT")}
                                <span className='align-right'>{quotation.direction == 'pq' ? 'Purchase Quotation' : 'Sales Quotation'}</span>
                            </p>
                            {quotation.direction === 'pq' ?
                                <React.Fragment>
                                    <p className='quotation-price flex-horizontal-container'>Price: ${quotation.quotation}</p>
                                    <p className='quotation-person'>Vendor: {quotation.vendor.vendor_name}</p>
                                </React.Fragment>
                                :
                                <React.Fragment>
                                    <p className='quotation-price flex-horizontal-container'>Price: ${quotation.quotation}</p>
                                    <p className='quotation-person'>Customer: {quotation.customer.customer_name}</p>
                                </React.Fragment>}

                            <span className='quotation-decision'>
                                {quotation.decision === 'approved' && <Tag icon={<CheckCircleOutlined />} color="success">{quotation.decision}</Tag>}
                                {quotation.decision === 'rejected' && <Tag icon={<CloseCircleOutlined />} color="error">{quotation.decision}</Tag>}
                                {quotation.decision === 'pending' && <Tag icon={<SyncOutlined spin />} color="processing">{quotation.decision}</Tag>}
                            </span>

                            <div className='quotation-options'>
                                <Dropdown placement="bottomRight" overlay={() => actions(quotation)}>
                                    <Button size='small' type='text'><MoreOutlined /></Button>
                                </Dropdown>

                                <Popover content={() => details(quotation)} >
                                    <Button size='small' type='text'><PlusOutlined /></Button>
                                </Popover>
                            </div>
                        </div>
                    </Timeline.Item>
                ))}
            </Timeline>
                        : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />

            */


/*

                {desktop ?
                    <VerticalTimeline animate={false}>
                        {quotations.map(quotation => (
                            <React.Fragment key={quotation.quotation_id + 'fragment'}>
                                {quotation.direction == 'pq' ?
                                    <VerticalTimelineElement
                                        className="vertical-timeline-element--work"
                                        contentStyle={{ background: '#ff6347', color: '#fff' }}
                                        contentArrowStyle={{ borderRight: '7px solid  #ff6347' }}
                                        date={<span style={{ color: '#000' }}>{quotation.date_time.slice(0, 10) + ' ' + quotation.date_time.slice(11, 19)}</span>}
                                        iconStyle={{ background: '#ff6347', color: '#fff' }}
                                        position='left'
                                        key={quotation.quotation_id}
                                    >
                                        <p style={{ margin: 0, padding: 0 }} key={quotation.quotation_id + 'vendor'}>Vendor: {quotation.vendor.vendor_name}
                                            {quotation.decision === 'approved' && <Tag icon={<CheckCircleOutlined />} color="success" className='float-right'>{quotation.decision}</Tag>}
                                            {quotation.decision === 'rejected' && <Tag icon={<CloseCircleOutlined />} color="error" className='float-right'>{quotation.decision}</Tag>}
                                            {quotation.decision === 'pending' && <Tag icon={<SyncOutlined spin />} color="processing" className='float-right'>{quotation.decision}</Tag>}
                                        </p>
                                        <hr />
                                        <p key={quotation.quotation_id + 'quotation'}>{quotation.quotation}</p>
                                    </VerticalTimelineElement>
                                    :
                                    <VerticalTimelineElement
                                        className="vertical-timeline-element--work"
                                        contentStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
                                        contentArrowStyle={{ borderRight: '7px solid  rgb(33, 150, 243)' }}
                                        date={<span style={{ color: '#000' }}>{quotation.date_time.slice(0, 10) + ' ' + quotation.date_time.slice(11, 19)}</span>}
                                        iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
                                        position='right'
                                        key={quotation.quotation_id}
                                    >
                                        <p style={{ margin: 0, padding: 0 }} key={quotation.quotation_id + 'customer'}>Customer: {quotation.customer.customer_name}
                                            {quotation.decision === 'approved' && <Tag icon={<CheckCircleOutlined />} color="success" className='float-right'>{quotation.decision}</Tag>}
                                            {quotation.decision === 'rejected' && <Tag icon={<CloseCircleOutlined />} color="error" className='float-right'>{quotation.decision}</Tag>}
                                            {quotation.decision === 'pending' && <Tag icon={<SyncOutlined spin />} color="processing" className='float-right'>{quotation.decision}</Tag>}
                                        </p>
                                        <hr />
                                        <p key={quotation.quotation_id + 'quotation'}>{quotation.quotation}</p>
                                    </VerticalTimelineElement>
                                }
                            </React.Fragment >
                        ))}
                    </VerticalTimeline >
                    :
                    */