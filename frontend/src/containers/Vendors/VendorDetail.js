import React, { useState, useEffect } from 'react'
import { Spin, Card, Result, Alert, Button, Empty, Tabs, Table, Descriptions, PageHeader, Timeline, List, Dropdown, Menu, Statistic } from 'antd';
import { ShoppingCartOutlined, ShoppingOutlined, UserOutlined, ContactsOutlined, MobileOutlined, PhoneOutlined, FireOutlined, HomeOutlined, CarOutlined, EllipsisOutlined } from '@ant-design/icons';
import VendorDrawer from '../../components/Vendors/Forms/VendorDrawer';
import VendorActivities from '../../components/Vendors/VendorActivities';
import 'react-vertical-timeline-component/style.min.css';
import '../../components/Opportunities/timeline.css'
import { useDispatch, useSelector } from 'react-redux'
import './vendor.css'
import SwipeableViews from 'react-swipeable-views';
import MoonLoader from "react-spinners/MoonLoader";
import WorkflowObjectComponent from '../Workflow/WorkflowObject/WorkflowObjectComponent';
import VendorGrid from './VendorGrid';
import { Responsive, WidthProvider } from 'react-grid-layout';
import VendorBudgetBlock from '../../components/Vendors/VendorBudgetBlock';
import CalendarDrawer from '../../components/Calendar/Form/CalendarDrawer';
import BaseCalendar from '../../components/Calendar/BaseCalendar';

const { TabPane } = Tabs;
const ResponsiveGridLayout = WidthProvider(Responsive);
//put calendar in jason

export default function VendorDetail(props) {

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch({ type: 'LOAD_LAYOUT' })
        dispatch({ type: 'VENDOR_CALENDAR_LIST', vendor_id: props.match.params.id })
        dispatch({ type: 'VENDOR_DETAIL', id: props.match.params.id })
    }, [props.match.params.id])

    const [index, setIndex] = useState(0);
    const vendor = useSelector(state => state.api.vendor)
    const loading = useSelector(state => state.loading.loading)
    const mediaquery = useSelector(state => state.mediaquery.size);
    const changeLayout = useSelector(state => state.layout.vendor.visible)
    const tasks = useSelector(state => state.calendar.customer_tasks)
    const formattedTask = tasks.map(task => ({
        ...task,
        start: new Date(task.start),
        end: new Date(task.end)
    }))

    const details = (vendor) => (
        <div className='details-col' key='details'>
            <PageHeader ghost={false} onBack={() => null} title={vendor.vendor_name}
                extra={
                    [vendor.permissions['sales.change_vendorinformation']
                        && vendor.is_at_last_stage.last_stage === false
                        || vendor.sap_code === null ? <VendorDrawer data={vendor}
                            button_name='Update Vendor'
                            title='Update Vendor'
                            component='VendorUpdate'
                            button_type='update'
                            button_style='default'
                        /> : null]}>
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

    const activities = (vendor) => (
        <Card title='Activities' className='activity-col' key='activities'>
            <VendorActivities vendor={vendor} />
        </Card>
    )

    const poc = (vendor) => (
        <Card title='POCs' className='poc-col'
            key='pocs'
            extra={[
                vendor.permissions['sales.add_vendorpoc'] ?
                    <VendorDrawer data={vendor.vendor_id}
                        button_name='Create POC'
                        title='Create POC'
                        component='POCCreate'
                        button_type='create'
                        button_style='ghost'
                        ghost={true}
                    /> : null
            ]}>
            <List
                size="large"
                dataSource={vendor.pocs}
                renderItem={item =>
                    <List.Item extra={
                        vendor.permissions['sales.change_vendorpoc'] ?
                            <div className='poc-update-button'>
                                <VendorDrawer data={item}
                                    button_name='Update POC'
                                    title='Update POC'
                                    component='POCUpdate'
                                    button_type='update'
                                    button_style='default'
                                />
                            </div>
                            :
                            null
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

    const workflow = () => (
        <Card className='workflow-col' key='workflow' title='Workflow'>
            <WorkflowObjectComponent
                workflow_class={vendor.workflow_id}
            />
        </Card>
    )

    const block = (vendor) => {
        return (
            <Card title="Budget Block" className='items-col' key='blocks'>
                <VendorBudgetBlock blocks={vendor.blocks} />
            </Card>
        )
    }

    const calendarMenu = () => (
        <Menu>
            <Menu.Item>
                <CalendarDrawer
                    button_name='Create Task'
                    title='Create New Task'
                    component='CreateTask'
                    data={{
                        'type': 'vendor',
                        'value': { 'id': vendor.vendor_id }
                    }}
                    button_type='create'
                />
            </Menu.Item>
        </Menu>
    )

    const calendar = () => (
        <Card title='Calendar' className='calendar-col' key='calendar'
            extra={[
                vendor.permissions['sales.add_tasks'] ?
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


    const row_height = 10

    const layout = useSelector(state => state.layout.vendor.layout)

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

    const breakpoint = useSelector(state => state.layout.vendor.breakpoint)

    const onBreakpointChange = breakpoint => {
        dispatch({ type: "BREAKPOINT_ONCHANGE", breakpoint: breakpoint, page: "vendor" })
    };

    return (
        loading['vendor'] === false ?
            (!vendor.error ?
                <React.Fragment>
                    <div className='vendor-grid'>
                        {changeLayout ?
                            <VendorGrid /> :
                            mediaquery === 'xs' ?

                                <React.Fragment>

                                    {details(vendor)}
                                    <div className='vendor-tabs-col'>
                                        <Tabs onChange={(value) => setIndex(parseInt(value))}
                                            activeKey={index.toString()}>
                                            <TabPane tab="Activities" key={0} />
                                            <TabPane tab="POCs" key={1} />
                                            <TabPane tab="Workflow" key={2} />
                                        </Tabs>
                                        <SwipeableViews enableMouseEvents index={index} onChangeIndex={(value) => setIndex(value)} animateHeight={true}>
                                            {activities(vendor)}
                                            {poc(vendor)}
                                            {workflow()}
                                        </SwipeableViews>
                                    </div>
                                </React.Fragment>

                                :
                                <ResponsiveGridLayout className="layout" layouts={static_layout}
                                    onBreakpointChange={(breakpoint) => onBreakpointChange(breakpoint)}
                                    breakpoints={{ lg: 1100, md: 896, sm: 668 }}
                                    cols={{ lg: 12, md: 10, sm: 6 }}
                                    rowHeight={row_height}
                                    compactType={'vertical'}
                                    preventCollision={false}>
                                    {layout[breakpoint].map(item => {
                                        return (item.i === 'details' ?
                                            details(vendor) : item.i === 'activities' ?
                                                activities(vendor) : item.i === 'pocs' ?
                                                    poc(vendor) : item.i === 'blocks' ?
                                                        block(vendor) : item.i === 'calendar' ?
                                                            calendar() :
                                                            workflow()
                                        )
                                    })}

                                </ResponsiveGridLayout>
                        }
                    </div>
                </React.Fragment>
                :
                <Result
                    status={vendor.error.status}
                    title={vendor.error.status}
                    subTitle={vendor.error.message.detail}
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
                    tip={`Retrieving Vendor ID: ${props.match.params.id}...`} />
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