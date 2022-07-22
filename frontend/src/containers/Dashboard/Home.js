import React, { useState, useRef, useEffect } from 'react'
import CustomerSource from '../../components/Dashboard/CustomerSource';
import CustomerConversion from '../../components/Dashboard/CustomerConversion';
import ActualRevenue from '../../components/Dashboard/ActualRevenue';
import CustomerCountry from '../../components/Dashboard/CustomerCountry';
import './home.css'
import CustomerConversionDaily from '../../components/Dashboard/CustomerConversionDaily';
import ProjectConversion from '../../components/Dashboard/ProjectConversion';
import KPI from '../../components/Dashboard/KPI';
import EstimatedRevenue from '../../components/Dashboard/EstimatedRevenue';
import { Select, Card, Row, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux'
import BaseCalendar from '../../components/Calendar/BaseCalendar'
import axiosInstance from '../../api/axiosApi';
import { GmailController } from '../../api/gmail_controller.js';
import CalendarDrawer from '../../components/Calendar/Form/CalendarDrawer';
import TicketConversion from '../../components/Dashboard/TicketConversion';

const { Option } = Select;

export default function Home() {

    const [group, setGroup] = useState('department')
    const [department, setDepartment] = useState(null);
    const gmailController = new GmailController()

    const dispatch = useDispatch()
    const loading = useSelector(state => state.loading.loading)
    const mediaquery = useSelector(state => state.mediaquery.size);
    const departmentAll = useSelector(state => state.api.department)
    const tasks = useSelector(state => state.calendar.project_tasks)
    const user = useSelector(state => state.auth.userprofile)
    const formattedTask = tasks.map(task => ({
        ...task,
        start: new Date(task.start),
        end: new Date(task.end)
    }))
    let emailIdToUpdate = []
    const getAssignedTickets = () => {
        axiosInstance.get(`/ticket/`).then(response => {
            for (let i = 0; i < response.data.length; i++) {
                if (response.data[i].assignedEmail) {
                    if (response.data[i].assigned_to.id === user) {
                        let index = emailIdToUpdate.findIndex(x => x == response.data[i].assignedEmail.emailId)
                        if (index === -1) {
                            emailIdToUpdate.push(response.data[i].assignedEmail.emailId)
                        }
                        else {
                            console.log('email ticket already exists')
                        }
                    }
                }
            }
            gmailController.updateTicketEmail(emailIdToUpdate).then((response) => {
                for (let i = 0; i < response.length; i++) {
                    let data = {}
                    data.content = JSON.stringify(response[i])
                    axiosInstance.patch(`/assigned-email/${response[i][0].threadid}/`, data)
                }
            })
        }).catch(error => {
            console.log(error)
        })
    }

    useEffect(() => {
        dispatch({ type: 'PERSONAL_CALENDAR_LIST' })
        getAssignedTickets()
    }, [])

    useEffect(() => {
        dispatch({ type: 'ANALYTICS', loading: 'analytics', group: group });
    }
        , [group])

    useEffect(() => {
        dispatch({ type: 'ANALYTICS', loading: 'analytics', group: group, department: department });
    }
        , [department])


    return (
        <React.Fragment>
            <Select defaultValue="department" onChange={(value) => setGroup(value)}>
                <Option value="department">Department</Option>
                <Option value="individual">Individual</Option>
            </Select>
            {group === 'department' ?
                <Select onChange={(value) => setDepartment(value)} style={{ display: 'none' }}>
                    {departmentAll.map(department => (
                        <Option value={department.department_id}>{department.department_name}</Option>
                    ))}
                </Select>
                : null}

            <hr />
            {loading['analytics'] === false ?
                <div className='analytics-grid'>
                    <div className='kpi-box'>
                        <KPI group={group} />
                    </div>
                    <div className='conversion-box analytics-stuff'>
                        <CustomerConversion group={group} />
                    </div>
                    <Card title='Personal Calendar' extra={[
                        <CalendarDrawer
                            button_name='Create Task'
                            title='Create New Task'
                            component='CreateTask'
                            button_type='create'
                            button_style='default'
                        />
                    ]} className='calendar-box analytics-stuff'>
                        {loading['personal_calendar'] === false ?
                            <BaseCalendar tasks={formattedTask} />
                            : null}
                    </Card>
                    {group === 'department' &&
                        <React.Fragment>
                            <div className='est-rev-box analytics-stuff'>
                                <EstimatedRevenue />
                            </div>
                            <div className='act-rev-box analytics-stuff'>
                                <ActualRevenue />
                            </div>
                            <div className='ticket-conversion-box analytics-stuff'>
                                <TicketConversion group={group} />
                            </div>
                            <div className='project-conversion-box analytics-stuff'>
                                <ProjectConversion group={group} />
                            </div>
                        </React.Fragment>}
                    <div className='source-box analytics-stuff'>
                        <CustomerSource group={group} />
                    </div>
                    <div className='country-box analytics-stuff'>
                        <CustomerCountry group={group} />
                    </div>

                </div>

                : <div style={{ textAlign: 'center' }}>
                    <Spin size='large' />
                </div>

            }
        </React.Fragment>
    )
}

/*

                    <div className='kpi-box'>
                        <KPI group={group} />
                    </div>

                    {group === 'department' &&
                        <React.Fragment>
                            <div className='est-rev-box'>
                                <EstimatedRevenue />
                            </div>
                            <div className='act-rev-box'>
                                <ActualRevenue />
                            </div>
                        </React.Fragment>}
                    <div className='source-box'>
                        <CustomerSource group={group} />
                    </div>
                    <div className='country-box'>
                        <CustomerCountry group={group} />
                    </div>

                    */
