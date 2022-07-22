import React, { useState, useEffect, Fragment } from 'react'
import QuotationTimeline from '../../components/Opportunities/QuotationTimeline';
import QuotationDeleted from '../../components/Opportunities/QuotationDeleted';
import RequirementTimeline from '../../components/Opportunities/RequirementTimeline';
import RequirementDeleted from '../../components/Opportunities/RequirementDeleted';
import ProjectCard from '../../components/Opportunities/ProjectCard';
import ActivitiesTimeline from '../../components/Opportunities/ActivitiesTimeline';
import RevenueForecast from '../../components/Opportunities/RevenueForecast';
import { Card, Spin, Collapse, Tabs, Statistic, Menu, Dropdown, Skeleton, Result, Button, Drawer, Alert } from 'antd';
import { CloseOutlined, EllipsisOutlined } from '@ant-design/icons';
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


const { Panel } = Collapse;
const { TabPane } = Tabs;
const ResponsiveGridLayout = WidthProvider(Responsive);


export default function ProjectGrid(props) {

    const project = useSelector(state => state.api.project)

    const tasks = useSelector(state => state.calendar.project_tasks)
    const loading = useSelector(state => state.loading.loading)
    const formattedTask = tasks.map(task => ({
        ...task,
        start: new Date(task.start),
        end: new Date(task.end)
    }))

    const loadingComponent = useSelector(state => state.loading.loadingComponent)

    const card = (item) => (
        <div className='card-col' key="card">
            {loadingComponent === 'project' ?
                <Card>
                    <Skeleton active avatar />
                </Card>
                :
                <ProjectCard project={project} />}
        </div>
    )

    const activities = (item) => {
        return (
            <Card title="Activities" className='activities-box' key="activities"
                extra={[removeButton(item)]}
            >
                <ActivitiesTimeline project={project} />
            </Card>
        )
    }

    const analytics = (item) => {
        return (
            <Card className='forecast-box' title='Revenue Forecast' key="forecast"
                extra={[removeButton(item)]}>
                <RevenueForecast revenue={project.revenue} />
            </Card>
        )
    }

    const calendar = (item) => {
        return (
            <Card className='calendar-box' key="calendar" title='Calendar'
                extra={[removeButton(item)]}
            >
                {loading['personal_calendar'] === false ?
                    <BaseCalendar tasks={formattedTask} />
                    : null}
            </Card >
        )
    }
    const workflow = (item) => {
        return (
            <Card key='workflow' className='workflow-box' title='Workflow'
                extra={[removeButton(item)]}>
                <WorkflowObjectComponent
                    workflow_class={project.workflow_id}
                    {...props}
                />
            </Card>
        )
    }

    const requirement = (item) => {
        return (
            <Card title='Requirements'
                className='requirements-box'
                key='requirements'
                extra={[removeButton(item)]}
            >
                <RequirementTimeline requirements={project.requirements.filter(requirement => requirement.status === 'active')} />
            </Card>
        )
    }

    const quotation = (item) => {
        return (
            <Card title="Quotations" className='quotations-box' key='quotations'
                extra={[removeButton(item)]}
            >
                <QuotationTimeline quotations={project.quotations.filter(quotation => quotation.status == 'active')} />
            </Card>
        )
    }

    const notation = (item) => {
        return (
            <Card title="Notations" className='notations-box' key='notations'
                extra={[removeButton(item)]}
            >
                <NotationList notations={project.notations.filter(notation => notation.status == 'active')} id={project.sales_project_id} />
            </Card>
        )
    }

    const block = (item) => {
        return (
            <Card title="Budget Block" className='items-box' key='blocks' extra={[removeButton(item)]} >
                <BudgetBlockList blocks={project.blocks} />
            </Card>
        )
    }

    const ticket = (item) => (
        <Card title='Tickets' className='ticket-box' key='tickets'
            extra={[removeButton(item)]}>
            <TicketProjectList tickets={project.tickets} />
        </Card>
    )

    useEffect(() => {
        return () => {
            dispatch({ type: "CHANGE_LAYOUT", page: 'project', visible: false })
        };
    }, []);

    const row_height = 10

    const layout = useSelector(state => state.layout.project.pre_layout)
    const breakpoint = useSelector(state => state.layout.project.breakpoint)

    const dispatch = useDispatch()

    const onBreakpointChange = breakpoint => {
        dispatch({ type: "BREAKPOINT_ONCHANGE", breakpoint: breakpoint, page: "project" })
    };

    const removeButton = (item) => (
        <Button size='small' type='text' onClick={() => removeItem(item)}><CloseOutlined /></Button>
    )

    const removeItem = (item) => {
        dispatch({ type: "ITEM_ONCHANGE", item: item, page: 'project', action: 'remove' })
    }

    const onLayoutChange = (layout, layouts) => {
        dispatch({ type: "LAYOUT_ONCHANGE", layout: layouts, page: 'project' })
    }

    return (
        <div className='project-grid'>
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
                    return (item.i === 'card' ?
                        card(item) : item.i === 'calendar' ?
                            calendar(item) : item.i === 'forecast' ?
                                analytics(item) : item.i === 'activities' ?
                                    activities(item) : item.i === 'requirements' ?
                                        requirement(item) : item.i === 'blocks' ?
                                            block(item) : item.i === 'quotations' ?
                                                quotation(item) : item.i === 'tickets' ?
                                                    ticket(item) : item.i === 'notations' ?
                                                        notation(item) : workflow(item)
                    )
                })}
            </ResponsiveGridLayout>
        </div>
    )
}
