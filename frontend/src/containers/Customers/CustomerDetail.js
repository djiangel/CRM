import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react'
import { Spin, Card, Result, Alert, Button, Empty, Tabs, Table, Descriptions, PageHeader, Timeline, List, Dropdown, Menu, Statistic } from 'antd';
import { ShoppingCartOutlined, ShoppingOutlined, UserOutlined, ContactsOutlined, MobileOutlined, PhoneOutlined, FireOutlined, HomeOutlined, CarOutlined, EllipsisOutlined } from '@ant-design/icons';
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

export default function CustomerDetail(props) {

    const dateFormat = require('dateformat');

    const dispatch = useDispatch()

    const [data, setData] = useState(null)
    useEffect(() => {
        dispatch({ type: 'LOAD_LAYOUT' })
        dispatch({ type: 'CUSTOMER_DETAIL', id: props.match.params.id })
        dispatch({ type: 'CUSTOMER_CALENDAR_LIST', customer_id: props.match.params.id })
        axiosInstance.get(`/customer-analytics/${props.match.params.id}/`)
            .then(response => {
                setData(response.data)
            })
            .catch(error => {
                console.log(error)
            })

    }, [props.match.params.id])

    const tasks = useSelector(state => state.calendar.customer_tasks)
    const formattedTask = tasks.map(task => ({
        ...task,
        start: new Date(task.start),
        end: new Date(task.end)
    }))

    const [index, setIndex] = useState(0);
    const [analyticsIndex, setAnalyticsIndex] = useState(0);

    const customer = useSelector(state => state.api.customer)
    const loading = useSelector(state => state.loading.loading)
    const mediaquery = useSelector(state => state.mediaquery.size);
    const changeLayout = useSelector(state => state.layout.customer.visible)

    const details = (customer) => (
        <div className='details-col' key='details'>
            <PageHeader ghost={false} onBack={() => null} title={customer.customer_name}
                extra={customer.permissions['change_customerinformation']
                    && customer.is_last_stage.last_stage === false?
                    [<CustomerDrawer data={customer}
                        key='customer-update'
                        button_name='Update Customer'
                        title='Update Customer'
                        component='CustomerUpdate'
                        button_type='update'
                        button_style='default'
                    />]
                    : null}>
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

    const activities = (customer) => (
        <Card title='Activities' className='activity-col' key='activities'>
            <CustomerActivities customer={customer} />
        </Card>
    )

    const poc = (customer) => (
        <Card title='POCs' className='poc-col'
            key='pocs'
            extra={[
                customer.permissions['sales.add_customerpoc'] ?
                    <CustomerDrawer data={customer.customer_id}
                        key='create-poc'
                        button_name='Create POC'
                        title='Create POC'
                        component='POCCreate'
                        button_type='create'
                        button_style='ghost'
                        ghost={true}
                    />
                    :
                    null
            ]}>
            <List
                size="large"
                dataSource={customer.pocs}
                renderItem={item =>
                    <List.Item extra={
                        <div className='poc-update-button'>
                            {customer.permissions['sales.change_customerpoc'] ?
                                <CustomerDrawer data={item}
                                    button_name='Update POC'
                                    title='Update POC'
                                    component='POCUpdate'
                                    button_type='update'
                                    button_style='default'
                                />
                                :
                                null
                            }
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


    const project = (customer) => (
        <Card title='Projects' className='customer-projects-col' key='projects'>
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

    const quotationMenu = () => (
        <Menu>
            <Menu.Item>
                {customer.permissions['sales.add_quotation'] ?
                    <CustomerDrawer data={customer.customer_id}
                        button_name='Create Quotation'
                        title='Create Quotation'
                        component='QuotationCreate'
                        button_type='create'
                    />
                    :
                    null}
            </Menu.Item>
            <Menu.Item>
                <CustomerQuotationDeleted permissions={customer.permissions} quotations={customer.quotations.filter(quotation => quotation.status === 'inactive')} />
            </Menu.Item>
        </Menu>
    )

    const quotation = (customer) => (
        <React.Fragment>
            <Card title='Spot Orders' className='spot-order-col' key='spot-orders'
                extra={[
                    <Dropdown overlay={quotationMenu}>
                        <EllipsisOutlined style={{ fontSize: '20px', color: '#fff' }} />
                    </Dropdown>
                ]}>
                <CustomerSpotOrder permissions={customer.permissions} quotations={customer.quotations.filter(quotation => quotation.status === 'active').filter(quotation => quotation.salesProject === null)} />
            </Card>
            <Card title='Project-Based' className='project-based-col' key='project-based'
                extra={[
                    <Dropdown overlay={quotationMenu}>
                        <EllipsisOutlined style={{ fontSize: '20px', color: '#fff' }} />
                    </Dropdown>
                ]}>
                <CustomerProjectQuotation permissions={customer.permissions} quotations={customer.quotations.filter(quotation => quotation.status === 'active').filter(quotation => quotation.salesProject !== null)} />
            </Card>
        </React.Fragment>

    )

    const spot_orders = () => (
        <Card title='Spot Orders' className='spot-order-col' key='spot-orders'
            extra={[
                <Dropdown overlay={quotationMenu} key='spot-order-dropdown'>
                    <EllipsisOutlined style={{ fontSize: '20px', color: '#fff' }} />
                </Dropdown>
            ]}>
            <CustomerSpotOrder permissions={customer.permissions} quotations={customer.quotations.filter(quotation => quotation.status === 'active').filter(quotation => quotation.salesProject === null)} />
        </Card>
    )

    const project_based = () => (
        <Card title='Project-Based' className='project-based-col' key='project-based'>
            <CustomerProjectQuotation permissions={customer.permissions} quotations={customer.quotations.filter(quotation => quotation.status === 'active').filter(quotation => quotation.salesProject !== null)} />
        </Card>
    )

    const ticket = (customer) => {
        let tickets = [];

        for (let i = 0; i < customer.pocs.length; i++) {
            tickets = tickets.concat(customer.pocs[i].tickets)
        }

        return (
            <Card title='Tickets' className='customer-ticket-col' key='tickets'>
                <TicketCustomerList tickets={tickets} />
            </Card>
        )
    }

    // analytics!!!

    const active_projects = () => (
        <Card className='customer-project-active' key='active-projects'>
            <Statistic
                title="Active Projects"
                value={data.active_count}
                valueStyle={{ color: '#3f8600' }}
            />
        </Card>
    )

    const completed_projects = () => (
        <Card className='customer-project-completed' key='completed-projects'>
            <Statistic
                title="Completed Projects"
                value={data.completed_count}
                valueStyle={{ color: '#3f8600' }}
            />
        </Card>
    )

    const revenue_count = () => (
        <Card className='customer-revenue-count' key='revenue-count'>
            <Statistic
                title="Generated Revenue"
                value={data.rev_sum}
                valueStyle={{ color: '#3f8600' }}
            />
        </Card>
    )

    const revenue_percent = () => (
        <Card className='customer-revenue-percent' key='revenue-percent'>
            <Statistic
                title="% of Dept Revenue"
                value={data.rev_percent}
                valueStyle={{ color: '#3f8600' }}
                suffix="%"
            />
        </Card>
    )

    const calendarMenu = () => (
        <Menu>
            <Menu.Item>
                <CalendarDrawer
                    button_name='Create Task'
                    title='Create New Task'
                    component='CreateTask'
                    data={{
                        'type': 'customer',
                        'value': { 'id': customer.customer_id }
                    }}
                    button_type='create'
                />
            </Menu.Item>
        </Menu>
    )

    const calendar = () => (
        <Card title='Calendar' className='calendar-col' key='calendar'
            extra={[
                customer.permissions['sales.add_tasks'] ?
                    <Dropdown overlay={calendarMenu} key='calendar-dropdown'>
                        <EllipsisOutlined style={{ fontSize: '20px', color: '#fff' }} />
                    </Dropdown>
                    :
                    null
            ]}
        >
            <BaseCalendar tasks={formattedTask} />
        </Card>
    )

    const workflow = () => (
        <Card className='workflow-col' key='workflow' title='Workflow'>
            <WorkflowObjectComponent
                workflow_class={customer.workflow_id}
            />
        </Card>
    )

    const row_height = 10

    const layout = useSelector(state => state.layout.customer.layout)
    const static_layout = {
        ...layout, 'lg': layout.lg.map(lay => {
            let output = Object.assign({}, lay);
            output['static'] = true;
            return output
        }
        ),
        'md': layout.md.map(lay => {
            let output = Object.assign({}, lay);
            output['static'] = true;
            return output
        }
        ),
        'sm': layout.sm.map(lay => {
            let output = Object.assign({}, lay);
            output['static'] = true;
            return output
        }
        ),
    }

    const breakpoint = useSelector(state => state.layout.customer.breakpoint)

    const onBreakpointChange = breakpoint => {
        dispatch({ type: "BREAKPOINT_ONCHANGE", breakpoint: breakpoint, page: "customer" })
    };

    return (
        loading['customer'] === false && data ?
            (!customer.error ?
                <React.Fragment>
                    {customer.is_at_last_stage.last_stage === true ?
                        <Alert
                            message="This Customer is closed"
                            description="This customer is either inactive or registered. All data has been locked. You may however add or update your POC Information."
                            type="error"
                            closable
                        /> : null}

                    <div className='customer-grid'>
                        {changeLayout ?
                            <CustomerGrid data={data} /> :
                            mediaquery === 'xs' ?

                                <React.Fragment>

                                    {details(customer)}

                                    <div className='analytics-col'>
                                        <Tabs onChange={(value) => setAnalyticsIndex(parseInt(value))}
                                            activeKey={analyticsIndex.toString()}>
                                            <TabPane tab='Calendar' key={0} />
                                            <TabPane tab="Workflow" key={1} />
                                            <TabPane tab="Analytics" key={2} />
                                        </Tabs>


                                        <SwipeableViews enableMouseEvents index={analyticsIndex} onChangeIndex={(value) => setAnalyticsIndex(value)} animateHeight={true}>
                                            {calendar()}
                                            {workflow()}
                                            <div className='analytics-stats'>
                                                {active_projects()}
                                                {completed_projects()}
                                                {revenue_count()}
                                                {revenue_percent()}
                                            </div>
                                        </SwipeableViews>
                                    </div>
                                    <div className='customer-tabs-col'>
                                        <Tabs onChange={(value) => { console.log(value); setIndex(parseInt(value)) }}
                                            activeKey={index.toString()}>
                                            <TabPane tab="Activities" key={0} />
                                            <TabPane tab="POCs" key={1} />
                                            <TabPane tab="Projects" key={2} />
                                            <TabPane tab="Spot Orders" key={3} />
                                            <TabPane tab="Project Quotations" key={4} />
                                        </Tabs>
                                        <SwipeableViews enableMouseEvents index={index} onChangeIndex={(value) => setIndex(value)} animateHeight={true}>
                                            {activities(customer)}
                                            {poc(customer)}
                                            {project(customer)}
                                            {spot_orders()}
                                            {project_based()}
                                        </SwipeableViews>
                                    </div>
                                </React.Fragment>

                                :
                                <ResponsiveGridLayout className="layout" layouts={static_layout}
                                    onBreakpointChange={(breakpoint) => onBreakpointChange(breakpoint)}
                                    autoSize={false}
                                    breakpoints={{ lg: 1100, md: 896, sm: 668 }}
                                    cols={{ lg: 12, md: 10, sm: 6 }}
                                    rowHeight={row_height}
                                    compactType={'vertical'}
                                    preventCollision={false}>
                                    {layout[breakpoint].map(item => {
                                        return (item.i === 'details' ?
                                            details(customer) : item.i === 'calendar' ?
                                                calendar() : item.i === 'workflow' ?
                                                    workflow() : item.i === 'active-projects' ?
                                                        active_projects() : item.i === 'completed-projects' ?
                                                            completed_projects() : item.i === 'revenue-count' ?
                                                                revenue_count() : item.i === 'revenue-percent' ?
                                                                    revenue_percent() : item.i === 'activities' ?
                                                                        activities(customer) : item.i === 'pocs' ?
                                                                            poc(customer) : item.i === 'projects' ?
                                                                                project(customer) : item.i === 'spot-orders' ?
                                                                                    spot_orders() : item.i === 'project-based' ?
                                                                                        project_based() : ticket(customer)
                                        )
                                    })}

                                </ResponsiveGridLayout>
                        }
                    </div>
                </React.Fragment>
                :
                <Result
                    status={customer.error.status}
                    title={customer.error.status}
                    subTitle={customer.error.message.detail}
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
                    tip={`Retrieving Customer ID: ${props.match.params.id}...`} />
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
