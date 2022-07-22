import React, { useState, useEffect } from 'react'
import { Spin, Card, Result, Alert, Button, Empty, Tabs, Table, Descriptions, PageHeader, Timeline, List, Dropdown, Menu, Statistic } from 'antd';
import { ShoppingCartOutlined, ShoppingOutlined, UserOutlined, ContactsOutlined, MobileOutlined, PhoneOutlined, FireOutlined, HomeOutlined, CarOutlined, CloseOutlined } from '@ant-design/icons';
import WorkflowObjectComponent from '../Workflow/WorkflowObject/WorkflowObjectComponent';
import 'react-vertical-timeline-component/style.min.css';
import '../../components/Opportunities/timeline.css'
import { useDispatch, useSelector } from 'react-redux'
import './vendor.css'
import { Responsive, WidthProvider } from 'react-grid-layout';
import VendorActivities from '../../components/Vendors/VendorActivities';
import VendorDrawer from '../../components/Vendors/Forms/VendorDrawer';
import VendorBudgetBlock from '../../components/Vendors/VendorBudgetBlock';
import BaseCalendar from '../../components/Calendar/BaseCalendar';

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function VendorDetail({ data }) {

    const dispatch = useDispatch()

    const vendor = useSelector(state => state.api.vendor)
    const tasks = useSelector(state => state.calendar.customer_tasks)
    const formattedTask = tasks.map(task => ({
        ...task,
        start: new Date(task.start),
        end: new Date(task.end)
    }))

    const details = (item) => (
        <div className='details-col' key='details'>
            <PageHeader ghost={false} onBack={() => null} title={vendor.vendor_name}
                extra={[removeButton(item)]}>
                <div className='vendor-detail-grid'>
                    <div className='vendor-vendor-id'><FireOutlined />Vendor ID: {vendor.vendor_id}</div>
                    <div className='vendor-phone-number'><MobileOutlined />Telephone: {vendor.telephone_number}</div>
                    <div className='vendor-fax-number'><PhoneOutlined />Fax: {vendor.fax_number}</div>
                    <div className='vendor-country'><HomeOutlined />Inc Country: {vendor.country.name}</div>
                    <div className='vendor-creator'><UserOutlined />Creator: {vendor.creator.user.username}</div>
                    <div className='vendor-address'><ShoppingCartOutlined />Address: {vendor.address}</div>
                </div>
            </PageHeader>
        </div>
    )


    const activities = (item) => (
        <Card title='Activities' className='activity-col' key='activities' extra={[removeButton(item)]}>
            <VendorActivities vendor={vendor} />
        </Card>
    )


    const poc = (item) => (
        <Card title='POCs' className='poc-col'
            key='pocs'
            extra={[removeButton(item)]}>
            <List
                size="large"
                dataSource={vendor.pocs}
                renderItem={item =>
                    <List.Item extra={
                        <div className='poc-update-button'>
                            <VendorDrawer data={item}
                                button_name='Update POC'
                                title='Update POC'
                                component='POCUpdate'
                                button_type='update'
                                button_style='default'
                            />
                        </div>
                    }>
                        <div className='poc-flexbox'>
                            <p><UserOutlined />Name: {item.name}</p>
                            <p><ContactsOutlined />Email: {item.email}</p>
                            <p><MobileOutlined />Number: {item.number}</p>
                        </div>
                    </List.Item>}
            />
        </Card>
    )

    const workflow = (item) => (
        <Card className='workflow-col' key='workflow' title='Workflow'
            extra={[removeButton(item)]}>
            <WorkflowObjectComponent
                workflow_class={vendor.workflow_id}
            />
        </Card>
    )

    const block = (item) => {
        return (
            <Card title="Budget Block" className='items-col' key='blocks'
                extra={[removeButton(item)]}>
                <VendorBudgetBlock blocks={vendor.blocks} />
            </Card>
        )
    }

    const calendar = (item) => (
        <Card title='Calendar' className='calendar-col' key='calendar'
            extra={[removeButton(item)]}
        >
            <BaseCalendar tasks={formattedTask} />
        </Card>
    )


    useEffect(() => {
        return () => {
            dispatch({ type: "CHANGE_LAYOUT", page: 'vendor', visible: false })
        };
    }, []);

    const row_height = 10

    const layout = useSelector(state => state.layout.vendor.pre_layout)
    const breakpoint = useSelector(state => state.layout.vendor.breakpoint)

    const onBreakpointChange = breakpoint => {
        dispatch({ type: "BREAKPOINT_ONCHANGE", breakpoint: breakpoint, page: "vendor" })
    };

    const removeButton = (item, float) => (
        <Button size='small' type='text' onClick={() => removeItem(item)} style={float && { float: 'right' }}><CloseOutlined /></Button>
    )

    const removeItem = (item) => {
        dispatch({ type: "ITEM_ONCHANGE", item: item, page: 'vendor', action: 'remove' })
    }

    const onLayoutChange = (layout, layouts) => {
        dispatch({ type: "LAYOUT_ONCHANGE", layout: layouts, page: 'vendor' })
    }

    return (
        <div className='vendor-grid'>
            <ResponsiveGridLayout className="layout" layouts={layout}
                onLayoutChange={(layout, layouts) =>
                    onLayoutChange(layout, layouts)
                }
                onBreakpointChange={(breakpoint) => onBreakpointChange(breakpoint)}
                breakpoints={{ lg: 1100, md: 896, sm: 668 }}
                cols={{ lg: 12, md: 10, sm: 6 }}
                rowHeight={row_height}
                compactType={'vertical'}
                preventCollision={false}>
                {layout[breakpoint].map(item => {
                    return (item.i === 'details' ?
                        details(item) : item.i === 'activities' ?
                            activities(item) : item.i === 'pocs' ?
                                poc(item) : item.i === 'blocks' ?
                                    block(item) : item.i === 'calendar' ?
                                        calendar() :
                                        workflow(item)
                    )
                })}

            </ResponsiveGridLayout>
        </div>
    )
}


/*<WorkflowObjectComponent
    workflow_class={customer.workflow_id}
    {...this.props}
/>*/


/*

                <div className='projects-col'>
                    {customer.projects.length ?
                        <Table dataSource={customer.projects} bordered>
                            <Column title="Project ID" dataIndex="sales_project_id" key="sales_project_id"
                                render={id => (
                                    <Button type='primary' shape='circle'>
                                        <Link to={`/project/detail/${id}`}>
                                            {id}
                                        </Link>
                                    </Button>
                                )} />
                            <Column title="Project Name" dataIndex="sales_project_name" key="sales_project_name" />
                        </Table>
                        : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    }
                </div>

                */