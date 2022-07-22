import React, { useRef, useEffect, useState } from "react";
import axiosInstance from '../../api/axiosApi';
import { Statistic, Row, Col, Empty, Card, Typography, Select, Tabs, Dropdown, Menu } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import SwipeableViews from 'react-swipeable-views';
import CalendarDrawer from '../Calendar/Form/CalendarDrawer'
import BaseCalendar from '../Calendar/BaseCalendar'
import WorkflowObjectComponent from '../../containers/Workflow/WorkflowObject/WorkflowObjectComponent';

const { Text } = Typography
const { Option } = Select;
const { TabPane } = Tabs;

export default function CustomerAnalytics({ id, workflow_id }) {

    const [data, setData] = useState(null)
    const [metric, setMetric] = useState('all-time')
    const mediaquery = useSelector(state => state.mediaquery.size);
    const tasks = useSelector(state => state.calendar.project_tasks)
    const loading = useSelector(state => state.loading.loading)
    const formattedTask = tasks.map(task => ({
        ...task,
        start: new Date(task.start),
        end: new Date(task.end)
    }))

    const [key, setKey] = useState(0);
    const [analyticsIndex, setAnalyticsIndex] = useState(0);

    useEffect(() => {
        axiosInstance.get(`/customer-analytics/${id}/?metric=${metric}`)
            .then(response => {
                setData(response.data)
            })
            .catch(error => {
                console.log(error)
            })
    }
        , [metric])

    const statistics = (data) => (
        <React.Fragment>
            <Card className='customer-project-active' key='active-projects'>
                <Statistic
                    title="Active Projects"
                    value={data.active_count}
                    valueStyle={{ color: '#3f8600' }}
                />
            </Card>
            <Card className='customer-project-completed' key='completed-projects'>
                <Statistic
                    title="Completed Projects"
                    value={data.completed_count}
                    valueStyle={{ color: '#3f8600' }}
                />
            </Card>
            <Card className='customer-revenue-count' key='revenue-count'>
                <Statistic
                    title="Generated Revenue"
                    value={data.rev_sum}
                    valueStyle={{ color: '#3f8600' }}
                />
            </Card>
            <Card className='customer-revenue-percent' key='revenue-percent'>
                <Statistic
                    title="% of Dept Revenue"
                    value={data.rev_percent}
                    valueStyle={{ color: '#3f8600' }}
                    suffix="%"
                />
            </Card>
        </React.Fragment>
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
                        'value': { 'id': id }
                    }}
                    button_type='create'
                />
            </Menu.Item>
        </Menu>
    )

    const chart = (data) => (
        <React.Fragment>
            {mediaquery === 'xs' ?
                <React.Fragment>
                    <Tabs activeKey={analyticsIndex.toString()} onChange={(value) => setAnalyticsIndex(parseInt(value))}
                    >
                        <TabPane tab="Calendar" key="0" />
                        <TabPane tab="Workflow" key="1" />
                    </Tabs>

                    <SwipeableViews className='swipeable-analytics' enableMouseEvents index={analyticsIndex} onChangeIndex={(value) => setAnalyticsIndex(value)} animateHeight={true}>
                        <div style={{ height: '100%' }}>
                            {loading['personal_calendar'] === false ?
                                <React.Fragment>
                                    <BaseCalendar tasks={formattedTask} />
                                </React.Fragment>
                                : null}
                        </div>
                        <div style={{ height: '100%' }}>
                            <WorkflowObjectComponent
                                workflow_class={workflow_id}
                            />
                        </div>
                    </SwipeableViews>
                </React.Fragment>
                :
                <Tabs defaultActiveKey="0" onChange={(value) => { console.log(value); setKey(value) }}
                    tabBarExtraContent={key === '0' ?
                        <Dropdown overlay={calendarMenu}>
                            <EllipsisOutlined style={{ fontSize: '20px' }} />
                        </Dropdown>
                        : null}
                >
                    <TabPane tab="Calendar" key="0">
                        {loading['personal_calendar'] === false ?
                            <React.Fragment>
                                <BaseCalendar tasks={formattedTask} />
                            </React.Fragment>
                            : null}
                    </TabPane>
                    <TabPane tab="Workflow" key="1">
                        <WorkflowObjectComponent
                            workflow_class={workflow_id}
                        />
                    </TabPane>
                </Tabs>
            }
        </React.Fragment>
    )

    return (
        data ?
            <React.Fragment>
                {statistics(data)}
                <Card title='Calendar' className='calendar-col' key='calendar'
                    extra={[
                        <Dropdown overlay={calendarMenu}>
                            <EllipsisOutlined style={{ fontSize: '20px' }} />
                        </Dropdown>
                    ]}
                >
                    <BaseCalendar tasks={formattedTask} />
                </Card>
                <Card className='workflow-col' key='workflow'>
                    <WorkflowObjectComponent
                        workflow_class={workflow_id}
                    />
                </Card>
            </React.Fragment>
            : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
    )
}

/*

                    <Select value={metric} onChange={(value) => setMetric(value)} className='customer-select-time'>
                        <Option value='all-time'>All-Time</Option>
                        <Option value='month'>Current Month</Option>
                        <Option value='quarter'>Current Quarter</Option>
                        <Option value='year'>Current Year</Option>
                    </Select>

                    */
