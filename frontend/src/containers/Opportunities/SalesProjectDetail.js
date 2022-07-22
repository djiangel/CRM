import React, { useState, useEffect, useRef } from 'react'
import QuotationTimeline from '../../components/Opportunities/QuotationTimeline';
import QuotationDeleted from '../../components/Opportunities/QuotationDeleted';
import RequirementTimeline from '../../components/Opportunities/RequirementTimeline';
import RequirementDeleted from '../../components/Opportunities/RequirementDeleted';
import ProjectCard from '../../components/Opportunities/ProjectCard';
import ActivitiesTimeline from '../../components/Opportunities/ActivitiesTimeline';
import RevenueForecast from '../../components/Opportunities/RevenueForecast';
import { Card, Spin, Collapse, Tabs, notification, Menu, Dropdown, Skeleton, Result, Button, Drawer, Alert } from 'antd';
import { FullscreenOutlined, EllipsisOutlined } from '@ant-design/icons';
import BudgetBlockList from '../../components/Opportunities/BudgetBlockList';
import OpportunityDrawer from '../../components/Opportunities/Forms/OpportunityDrawer';
import NotationList from '../../components/Opportunities/NotationList';
import WorkflowObjectComponent from '../Workflow/WorkflowObject/WorkflowObjectComponent';
import { useDispatch, useSelector } from 'react-redux'
import './project.css'
import SwipeableViews from 'react-swipeable-views';
import BaseCalendar from '../../components/Calendar/BaseCalendar'
import MoonLoader from "react-spinners/MoonLoader";
import CalendarDrawer from '../../components/Calendar/Form/CalendarDrawer'
import {
    Legend, BarChart, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Line, ResponsiveContainer
} from 'recharts';
import TicketProjectList from '../../components/Opportunities/TicketProjectList';
import RevenueForecastList from '../../components/Opportunities/RevenueForecastList';
import { useMediaQuery } from 'react-responsive'
import { Responsive, WidthProvider } from 'react-grid-layout';
import ProjectGrid from './ProjectGrid';
import ProjectGridTest from './ProjectGridTest';

const { Panel } = Collapse;
const { TabPane } = Tabs;
const ResponsiveGridLayout = WidthProvider(Responsive);


export default function SalesProjectDetail(props) {

    const dispatch = useDispatch()

    const blockRef = useRef(null);

    const [visible, setVisible] = useState(false);

    useEffect(() => {
        dispatch({ type: 'LOAD_LAYOUT' })
        dispatch({ type: 'SALES_PROJECT_DETAIL', id: props.match.params.id })
        dispatch({ type: 'PROJECT_CALENDAR_LIST', project_id: props.match.params.id })
    }, [props.match.params.id])

    const tasks = useSelector(state => state.calendar.project_tasks)
    const loading = useSelector(state => state.loading.loading)
    const formattedTask = tasks.map(task => ({
        ...task,
        start: new Date(task.start),
        end: new Date(task.end)
    }))

    const project = useSelector(state => state.api.project)
    const loadingComponent = useSelector(state => state.loading.loadingComponent)
    const changeLayout = useSelector(state => state.layout.project.visible)

    const mediaquery = useSelector(state => state.mediaquery.size);

    const [index, setIndex] = useState(0);
    const [analyticsIndex, setAnalyticsIndex] = useState(0);

    const card = (project) => (
        <div className='card-col' key="card">
            {loadingComponent === 'project' ?
                <Card>
                    <Skeleton active avatar />
                </Card>
                :
                <ProjectCard project={project} />}
        </div>
    )

    const activities = (project) => {
        return (
            <Card title="Activities" className='activities-box' key="activities">
                <ActivitiesTimeline project={project} />
            </Card>
        )
    }

    const forecastMenu = () => (
        <Menu>
            {project.permissions['sales.add_revenueforecast'] && project.is_at_last_stage.last_stage === false ?
                <Menu.Item>
                    <OpportunityDrawer
                        button_name='Add Revenue Forecast'
                        title='Add Revenue Forecast'
                        component='ForecastCreate'
                        button_type='create' />
                </Menu.Item>
                :
                null
            }
            <Menu.Item>
                <RevenueForecastList forecasts={project.forecasts.filter(forecast => forecast.status === 'active')} />
            </Menu.Item>
        </Menu>
    )


    const calendarMenu = () => (
        <Menu>
            <Menu.Item>
                <CalendarDrawer
                    button_name='Create Task'
                    title='Create New Task'
                    component='CreateTask'
                    data={{
                        'type': 'project',
                        'value': { 'id': project.sales_project_id }
                    }}
                    button_type='create'
                />
            </Menu.Item>
        </Menu>
    )

    const analytics = (project) => {
        return (
            <Card className='forecast-box' title='Revenue Forecast' key="forecast"
                extra={[
                    <Dropdown overlay={forecastMenu} key='dropdown-analytics'>
                        <EllipsisOutlined style={{ fontSize: '20px', color: '#fff' }} />
                    </Dropdown>
                ]}
            >
                <RevenueForecast revenue={project.revenue} />
            </Card>
        )
    }

    const calendar = () => {
        return (
            <Card className='calendar-box' key="calendar" title='Calendar'
                extra={project.permissions['sales.add_tasks'] ? [
                    <Dropdown overlay={calendarMenu} key='dropdown-calendar'>
                        <EllipsisOutlined style={{ fontSize: '20px', color: '#fff' }} />
                    </Dropdown>
                ] : null}
            >
                {loading['personal_calendar'] === false ?
                    <BaseCalendar tasks={formattedTask} />
                    : null}
            </Card >
        )
    }

    //extra={[<Button size='small' key='workflow-fullscreen' type='text' style={{ color: '#fff' }} onClick={() => setVisible(true)}><FullscreenOutlined /></Button>]}

    const workflow = (project) => {
        return (
            <Card key='workflow' className='workflow-box' title='Workflow'>
                <WorkflowObjectComponent
                    workflow_class={project.workflow_id}
                    {...props}
                />
            </Card>
        )
    }

    const requirementMenu = () => (
        <Menu>
            {project.permissions['sales.add_customerrequirement'] && project.is_at_last_stage.last_stage === false ?
                <Menu.Item>
                    <OpportunityDrawer button_name='Create Requirement'
                        title='Create Requirement'
                        component='RequirementCreate'
                        button_type='create' />
                </Menu.Item> : null}
            <Menu.Item>
                <RequirementDeleted requirements={project.requirements.filter(requirement => requirement.status === 'inactive')} />
            </Menu.Item>
        </Menu>
    )

    const requirement = (project) => {
        return (
            <Card title='Requirements'
                className='requirements-box'
                key='requirements'
                extra={[
                    <Dropdown overlay={requirementMenu} key='dropdown-requirements'>
                        <EllipsisOutlined style={{ fontSize: '20px', color: '#fff' }} />
                    </Dropdown>
                ]}
            >
                <RequirementTimeline requirements={project.requirements.filter(requirement => requirement.status === 'active')} />
            </Card>
        )
    }

    const quotationMenu = () => (
        <Menu>
            {project.permissions['sales.add_quotation'] ?
                <Menu.Item>
                    <OpportunityDrawer data={project.sales_project_id}
                        button_name='Create Sales Quotation'
                        title='Create Sales Quotation'
                        component='QuotationCreate'
                        button_type='create'
                    />
                </Menu.Item> : null}
            <Menu.Item>
                <QuotationDeleted quotations={project.quotations.filter(quotation => quotation.status == 'inactive')} />
            </Menu.Item>
        </Menu>
    )

    const quotation = (project, type) => {
        return (
            <Card title="Quotations" className='quotations-box' key='quotations'
                extra={[
                    <Dropdown overlay={quotationMenu} key='dropdown-quotations'>
                        <EllipsisOutlined style={{ fontSize: '20px', color: '#fff' }} />
                    </Dropdown>
                ]}
            >
                <QuotationTimeline quotations={project.quotations.filter(quotation => quotation.status == 'active')} />
            </Card>
        )
    }

    const notationMenu = () => (
        <Menu>
            {project.permissions['sales.add_salesnotation'] ?
                <Menu.Item>
                    <OpportunityDrawer data={props.match.params.id}
                        button_name='Create Notation'
                        title='Create Notation'
                        component='NotationCreate'
                        button_type='create'
                    />
                </Menu.Item> : null}
        </Menu>
    )


    const notation = (project) => {
        return (
            <Card title="Notations" className='notations-box' key='notations'
                extra={[
                    <Dropdown overlay={notationMenu} key='dropdown-notations'>
                        <EllipsisOutlined style={{ fontSize: '20px', color: '#fff' }} />
                    </Dropdown>
                ]}
            >
                <NotationList notations={project.notations.filter(notation => notation.status == 'active')} id={project.sales_project_id} />
            </Card>
        )
    }

    const blockMenu = () => (
        <Menu>
            {project.permissions['sales.add_budgetblock'] && project.is_at_last_stage.last_stage === false ?
                <Menu.Item>
                    <OpportunityDrawer data={project.items}
                        button_name='Create Budget Block'
                        title='Create Budget Block'
                        component='BudgetBlockCreate'
                        button_type='create'
                    />
                </Menu.Item>
                : null}
        </Menu>
    )

    const block = (project) => {
        return (
            <Card title="Budget Block" className='items-box' ref={blockRef} key='blocks' extra={[
                <Dropdown overlay={blockMenu} key='dropdown-blocks'>
                    <EllipsisOutlined style={{ fontSize: '20px', color: '#fff' }} />
                </Dropdown>
            ]} >
                <BudgetBlockList blocks={project.blocks} />
            </Card>
        )
    }

    const ticket = (project) => (
        <Card title='Tickets' className='ticket-box' key='tickets'>
            <TicketProjectList tickets={project.tickets} />
        </Card>
    )

    const row_height = 10

    const layout = useSelector(state => state.layout.project.layout)
    const pre_layout = useSelector(state => state.layout.project.pre_layout)

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

    const breakpoint = useSelector(state => state.layout.project.breakpoint)

    const onBreakpointChange = breakpoint => {
        dispatch({ type: "BREAKPOINT_ONCHANGE", breakpoint: breakpoint, page: "project" })
    };

    const openNotification = () => {
        notification.open({
            message: 'You are in Change Layout mode',
            description:
                'Do take note that within this mode, you would be able to change the size and layout of the cards',
            duration: 0,
        });
    };

    const isFirstRender = React.useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
    })

    return (
        loading['salesproject'] === false ?
            (!project.error ?
                <React.Fragment>
                    {project.is_at_last_stage.last_stage === true ?
                        <Alert
                            message="This Project is closed"
                            description="This project is currently closed. All data has been locked. You can however add/assign quotations and leave notations on this project."
                            type="error"
                            closable
                        /> : null}

                    {changeLayout ?
                        <ProjectGrid project={project} onClick={openNotification} />
                        :
                        mediaquery === 'xs' ?
                            <React.Fragment>
                                <div className='project-grid'>
                                    {card(project)}
                                    <div className='analytics-col'>
                                        <Tabs onChange={(value) => setAnalyticsIndex(parseInt(value))}
                                            activeKey={analyticsIndex.toString()}>
                                            <TabPane tab='Calendar' key={0} />
                                            <TabPane tab="Forecast" key={1} />
                                            <TabPane tab="Workflow" key={2} />
                                        </Tabs>


                                        <SwipeableViews enableMouseEvents index={analyticsIndex} onChangeIndex={(value) => setAnalyticsIndex(value)} animateHeight={true}>
                                            {calendar()}
                                            {analytics(project)}
                                            {workflow(project)}
                                        </SwipeableViews>
                                    </div>

                                    <div className='tabs-col'>
                                        <Tabs onChange={(value) => setIndex(parseInt(value))}
                                            activeKey={index.toString()}>
                                            <TabPane tab='Activities' key={0} />
                                            <TabPane tab="Requirements" key={1} />
                                            <TabPane tab="Budget Blocks" key={2} />
                                            <TabPane tab="Quotations" key={3} />
                                            <TabPane tab="Tickets" key={4} />
                                            <TabPane tab="Notations" key={5} />
                                        </Tabs>


                                        <SwipeableViews enableMouseEvents index={index} onChangeIndex={(value) => setIndex(value)} animateHeight={true}>
                                            {activities(project)}
                                            {requirement(project)}
                                            {block(project)}
                                            {quotation(project)}
                                            {ticket(project)}
                                            {notation(project)}
                                        </SwipeableViews>
                                    </div>
                                </div>
                            </React.Fragment>
                            :
                            <div className='project-grid'>
                                <ResponsiveGridLayout className="layout" layouts={static_layout}
                                    onBreakpointChange={(breakpoint) => onBreakpointChange(breakpoint)}
                                    breakpoints={{ lg: 1100, md: 896, sm: 668 }}
                                    cols={{ lg: 12, md: 10, sm: 6 }}
                                    rowHeight={row_height}
                                    compactType={'vertical'}
                                    preventCollision={false}>
                                    {layout[breakpoint].map(item => {
                                        return (item.i === 'card' ?
                                            card(project) : item.i === 'calendar' ?
                                                calendar() : item.i === 'forecast' ?
                                                    analytics(project) : item.i === 'activities' ?
                                                        activities(project) : item.i === 'requirements' ?
                                                            requirement(project) : item.i === 'blocks' ?
                                                                block(project) : item.i === 'quotations' ?
                                                                    quotation(project) : item.i === 'tickets' ?
                                                                        ticket(project) : item.i === 'notations' ?
                                                                            notation(project) :
                                                                            workflow(project)
                                        )
                                    })}

                                </ResponsiveGridLayout>
                            </div>
                    }
                </React.Fragment>
                :
                <Result
                    status={project.error.status}
                    title={project.error.status}
                    subTitle={project.error.message.detail ? project.error.message.detail : project.error.message}
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
                    tip={`Retrieving Project ID: ${props.match.params.id}...`} />
            </div>
    )
}