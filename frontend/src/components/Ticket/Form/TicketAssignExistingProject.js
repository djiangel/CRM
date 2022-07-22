
import React, { useState, useEffect, Fragment } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import DynamicForm from '../../Application/DynamicForm';
import axiosInstance from '../../../api/axiosApi';
import { Alert } from 'antd';
export default function TicketAssignExistingProject(props) {
    const dispatch = useDispatch()
    const [error, setError] = useState([]);
    const [projects, setProjects] = useState([]);
    const ticket = useSelector(state => state.ticket.ticket)
    useEffect(() => {
        axiosInstance.get(`/ticket/getsalesproject/?customer_infomation=${ticket.customerInformation.customer_id}`)
            .then(response => {
                setProjects(response.data)
            });
    }, [])

    const onSubmit = (data) => {
        data['ticket'] = ticket.id
        axiosInstance.post('ticket/assignexistingproject/', data)
            .then(response => {
                dispatch({
                    type: 'TICKET_COMPONENTS',
                    loading: 'ticket',
                    data: response.data,
                    fetch: 'UPDATE_TICKET_DETAILS',
                    message: `Successfully assigned Ticket to project`
                })
                props.onClose()
            })
            .catch(error => {
                if (error.response) setError(error.response.data)
            })
    };

    return (
        <Fragment>
            <Alert
                message="Warning"
                description="Only Projects that have the same associated customer as this ticket will be shown here"
                type="warning"
                showIcon
            />

            <DynamicForm className="form"
                model={[
                    { key: "salesProject", label: "Project", type: "fkey", options: projects, id: "sales_project_id", name: "sales_project_name" },
                ]}

                addon={[]}

                response={error}

                onSubmit={(data) => { onSubmit(data) }}
            />
        </Fragment>
    )

}

