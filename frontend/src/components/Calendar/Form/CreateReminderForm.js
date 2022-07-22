import React ,  { useState}from 'react'
import { useDispatch, useSelector } from 'react-redux'
import DynamicForm from '../../Application/DynamicForm';
import axiosInstance from '../../../api/axiosApi';

export default function CreateReminderForm(props) {
    const current_user = useSelector(state => state.auth.userprofile);
    const dispatch = useDispatch()
    const [error, setError] = useState([]);
    
    const onSubmit = (data) => {
        // To use this form , dev will have to pass in the type, title , content , as props to the form so that 
        // it can be used
        // automatically without user touching it.
        var newDate = new Date();
        if(data['range'] === 'Days'){
            newDate.setDate(newDate.getDate() + data['number']);
        }
        if(data['range'] === 'Months'){
            newDate.setMonth(newDate.getMonth() + data['number'])
        }
        if(data['range'] === 'Weeks'){
            newDate.setDate(newDate.getDate() + data['number'] * 7);
        }
        const newData = {}
        newData['user'] = [{'id':current_user}]
        newData['title'] = props.title
        newData['priority'] = data.priority
        newData['content'] = props.content
        newData['start'] = newDate
        newData['end'] = newDate
        axiosInstance.post(`/tasks/` , newData)
        .then(response => {
            dispatch({ type: 'CALENDAR_COMPONENTS',
                        loading: 'calendar',
                        data: response.data, 
                        fetch:'UPDATE_PERSONAL_TASKS',
                        message:`Successfully set reminder to your personal calendar.`})
            props.onClose()
        }).catch(error => {
            if (error.response) setError(error.response.data)
        })
    };

    return (
        <React.Fragment>
                 <DynamicForm className="form"
                    model={[
                    { key: "priority", label: "Priority" , type: "select" , options: ['low','medium','urgent'] },
                    { key: "range", label: "Range" , type: "select" , options: ['Days','Weeks','Months'] },
                    { key: "number", label: "No. Of" , type: 'number' },
                    ]}
                    addon={[]}
                    response={error}
                    onSubmit={(data) => { onSubmit(data) }}
                />
        </React.Fragment>
    )
}