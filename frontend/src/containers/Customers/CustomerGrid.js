import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react'
import { Spin, Card, Result, Alert, Button, Empty, Tabs, Table, Descriptions, PageHeader, Timeline, List, Dropdown, Menu, Statistic } from 'antd';
import { ShoppingCartOutlined, ShoppingOutlined, UserOutlined, ContactsOutlined, MobileOutlined, PhoneOutlined, FireOutlined, HomeOutlined, CarOutlined, CloseOutlined } from '@ant-design/icons';
import { connect } from "react-redux";
import CustomerDrawer from '../../components/Customers/Forms/CustomerDrawer';
import CustomerAnalytics from '../../components/Customers/CustomerAnalytics';
import CustomerProjectQuotation from '../../components/Customers/CustomerProjectQuotation';
import CustomerSpotOrder from '../../components/Customers/CustomerSpotOrder';
import CustomerActivities from '../../components/Customers/CustomerActivities';
import CustomerQuotationDeleted from '../../components/Customers/CustomerQuotationDeleted';
import WorkflowObjectComponent from '../Workflow/WorkflowObject/WorkflowObjectComponent';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import '../../components/Opportunities/timeline.css'
import { useDispatch, useSelector } from 'react-redux'
import './customer.css'
import { PermissionsChecker } from '../../api/PermissionsChecker';
import SwipeableViews from 'react-swipeable-views';
import TabsUI from '@material-ui/core/Tabs';
import TabUI from '@material-ui/core/Tab';
import MoonLoader from "react-spinners/MoonLoader";
import TicketCustomerList from '../../components/Customers/TicketCustomerList';
import { Responsive, WidthProvider } from 'react-grid-layout';
import CalendarDrawer from '../../components/Calendar/Form/CalendarDrawer'
import BaseCalendar from '../../components/Calendar/BaseCalendar'
import axiosInstance from '../../api/axiosApi';
import CustomerGrid from './CustomerGrid';

const { Column } = Table;
const { TabPane } = Tabs;
const ResponsiveGridLayout = WidthProvider(Responsive);

export default function CustomerDetail({ data }) {

    const dispatch = useDispatch()

    const customer = useSelector(state => state.api.customer)
    const person = useSelector(state => state.auth)
    const mediaquery = useSelector(state => state.mediaquery.size);
    const tasks = useSelector(state => state.calendar.project_tasks)
    const formattedTask = tasks.map(task => ({
        ...task,
        start: new Date(task.start),
        end: new Date(task.end)
    }))

    const details = (item) => (
        <div className='details-col' key='details'>
            <PageHeader ghost={false} onBack={() => null} title={customer.customer_name}
                extra={[removeButton(item)]}>
                <div className='customer-detail-grid'>
                    <div className='customer-customer-id'><FireOutlined />Customer ID: {customer.customer_id}</div>
                    <div className='customer-phone-number'><MobileOutlined />Telephone: {customer.telephone_number}</div>
                    <div className='customer-fax-number'><PhoneOutlined />Fax: {customer.fax_number}</div>
                    <div className='customer-country'><HomeOutlined />Country: {customer.country.name}</div>
                    <div className='customer-source'><CarOutlined />Source: {customer.source.source}</div>
                    <div className='customer-creator'><UserOutlined />Creator: {customer.creator.user.username}</div>
                    <div className='customer-address'><ShoppingCartOutlined />Address: {customer.address}</div>
                </div>
            </PageHeader>
        </div>
    )

    const activities = (item) => (
        <Card title='Activities' className='activity-col' key='activities' extra={[removeButton(item)]}>
            <CustomerActivities customer={customer} />
        </Card>
    )

    const poc = (item) => (
        <Card title='POCs' className='poc-col'
            key='pocs'
            extra={[removeButton(item)]}>
            <List
                size="large"
                dataSource={customer.pocs}
                renderItem={item =>
                    <List.Item extra={
                        <div className='poc-update-button'>
                            <CustomerDrawer data={item}
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

    const project = (item) => (
        <Card title='Projects' className='customer-projects-col' key='projects' extra={[removeButton(item)]}>
            {customer.projects.length ?
                <List
                    size="large"
                    dataSource={customer.projects}
                    renderItem={item =>
                        <List.Item>
                            <div className='customer-projects-flexbox'>
                                <p><UserOutlined />ID: {item.sales_project_id}</p>
                                <p><ContactsOutlined />Name:
                                            <Link to={`/project/detail/${item.sales_project_id}`}>
                                        {item.sales_project_name}
                                    </Link>
                                </p>
                            </div>
                        </List.Item>}
                />
                : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            }
        </Card>
    )

    const spot_orders = (item) => (
        <Card title='Spot Orders' className='spot-order-col' key='spot-orders'
            extra={[removeButton(item)]}>
            <CustomerSpotOrder permissions={customer.permissions} quotations={customer.quotations.filter(quotation => quotation.status === 'active').filter(quotation => quotation.salesProject === null)} />
        </Card>
    )

    const project_based = (item) => (
        <Card title='Project-Based' className='project-based-col' key='project-based'
            extra={[removeButton(item)]}>
            <CustomerProjectQuotation permissions={customer.permissions} quotations={customer.quotations.filter(quotation => quotation.status === 'active').filter(quotation => quotation.salesProject !== null)} />
        </Card>
    )

    const ticket = (item) => {
        let tickets = [];

        for (let i = 0; i < customer.pocs.length; i++) {
            tickets = tickets.concat(customer.pocs[i].tickets)
        }

        return (
            <Card title='Tickets' className='customer-ticket-col' key='tickets' extra={[removeButton(item)]}>
                <TicketCustomerList tickets={tickets} />
            </Card>
        )
    }

    // analytics!!!

    const active_projects = (item) => (
        <Card className='customer-project-active' key='active-projects'>
            {removeButton(item, 'right')}
            <Statistic
                title="Active Projects"
                value={data.active_count}
                valueStyle={{ color: '#3f8600' }}
            />
        </Card>
    )

    const completed_projects = (item) => (
        <Card className='customer-project-completed' key='completed-projects'>
            {removeButton(item, 'right')}
            <Statistic
                title="Completed Projects"
                value={data.completed_count}
                valueStyle={{ color: '#3f8600' }}
            />
        </Card>
    )

    const revenue_count = (item) => (
        <Card className='customer-revenue-count' key='revenue-count'>
            {removeButton(item, 'right')}
            <Statistic
                title="Generated Revenue"
                value={data.rev_sum}
                valueStyle={{ color: '#3f8600' }}
            />
        </Card>
    )

    const revenue_percent = (item) => (
        <Card className='customer-revenue-percent' key='revenue-percent'>
            {removeButton(item, 'right')}
            <Statistic
                title="% of Dept Revenue"
                value={data.rev_percent}
                valueStyle={{ color: '#3f8600' }}
                suffix="%"
            />
        </Card>
    )

    const calendar = (item) => (
        <Card title='Calendar' className='calendar-col' key='calendar'
            extra={[removeButton(item)]}
        >
            <BaseCalendar tasks={formattedTask} />
        </Card>
    )

    const workflow = (item) => (
        <Card className='workflow-col' key='workflow' title='Workflow'
            extra={[removeButton(item)]}>
            <WorkflowObjectComponent
                workflow_class={customer.workflow_id}
            />
        </Card>
    )

    useEffect(() => {
        return () => {
            dispatch({ type: "CHANGE_LAYOUT", page: 'customer', visible: false })
        };
    }, []);

    const row_height = 10

    const layout = useSelector(state => state.layout.customer.pre_layout)
    const breakpoint = useSelector(state => state.layout.customer.breakpoint)

    const onBreakpointChange = breakpoint => {
        dispatch({ type: "BREAKPOINT_ONCHANGE", breakpoint: breakpoint, page: "customer" })
    };

    const removeButton = (item, float) => (
        <Button size='small' type='text' onClick={() => removeItem(item)} style={float && { float: 'right' }}><CloseOutlined /></Button>
    )

    const removeItem = (item) => {
        dispatch({ type: "ITEM_ONCHANGE", item: item, page: 'customer', action: 'remove' })
    }

    const onLayoutChange = (layout, layouts) => {
        dispatch({ type: "LAYOUT_ONCHANGE", layout: layouts, page: 'customer' })
    }

    return (
        <div className='customer-grid'>
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
                        details(item) : item.i === 'calendar' ?
                            calendar(item) : item.i === 'workflow' ?
                                workflow(item) : item.i === 'active-projects' ?
                                    active_projects(item) : item.i === 'completed-projects' ?
                                        completed_projects(item) : item.i === 'revenue-count' ?
                                            revenue_count(item) : item.i === 'revenue-percent' ?
                                                revenue_percent(item) : item.i === 'activities' ?
                                                    activities(item) : item.i === 'pocs' ?
                                                        poc(item) : item.i === 'projects' ?
                                                            project(item) : item.i === 'spot-orders' ?
                                                                spot_orders(item) : item.i === 'project-based' ?
                                                                    project_based(item) : ticket(item)
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