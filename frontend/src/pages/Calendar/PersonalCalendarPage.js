import React ,  { useEffect, Fragment }from 'react'
import {  Views } from 'react-big-calendar'
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useDispatch, useSelector } from 'react-redux'
import { Spin , Card } from 'antd';
import BaseCalendar from '../../components/Calendar/BaseCalendar';


let allViews = Object.keys(Views).map(k => Views[k])

export default function PersonalCalendarPage() {
    const now = new Date()
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch({ type: 'PERSONAL_CALENDAR_LIST'})

    },[])
    const tasks = useSelector(state => state.calendar.tasks)
    const loading = useSelector(state => state.loading.loading)
    const formattedTask = tasks.map(task => ({...task , 
                                            start : new Date(task.start) , 
                                            end: new Date(task.end)
                                            }))
    return(
        loading['personal_calendar']=== false?
        <Fragment>
        <Card>
            <BaseCalendar
            tasks={formattedTask}
           />
        </Card>
              </Fragment>
        :
        <Spin></Spin>
)
}
