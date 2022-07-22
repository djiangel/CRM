import React, { useState, useEffect, Fragment } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import DynamicForm from '../../Application/DynamicForm';
import axiosInstance from '../../../api/axiosApi';

export default function TicketAssignNewProject(props) {
    const dispatch = useDispatch()
    const [error, setError] = useState([]);
    const [department, setDepartment] = useState([]);
    const [personnel, setPersonnel] = useState([]);
    const [currency, setCurrency] = useState([]);
    const ticket = useSelector(state => state.ticket.ticket)
    useEffect(() => {
        axiosInstance.get('/user-profile/')
            .then(response => {
                setPersonnel(response.data)
            });
        axiosInstance.get('/sales-department/')
            .then(response => {
                setDepartment(response.data);
            });
        axiosInstance.get('/sales-project/getcurrencies/')
            .then(response => {
                setCurrency(response.data);
            });
    }, [])

    const onSubmit = (data) => {
        if (!data.sales_department) {
            data.sales_department = department[0].department_id
        }
        data['customerInformation'] = ticket.customerInformation.customer_id
        data['ticket'] = ticket.id
        axiosInstance.post('ticket/assignnewproject/', data)
            .then(response => {
                dispatch({
                    type: 'TICKET_COMPONENTS',
                    loading: 'ticket',
                    data: response.data,
                    fetch: 'UPDATE_TICKET_DETAILS',
                    message: `Successfully created new project and assigned ticket`
                })
                props.onClose()
            })
            .catch(error => {
                if (error.response) setError(error.response.data)
            })
    };
    for (var i = 0; i < personnel.length; i++) {
        personnel[i]['username'] = personnel[i].user.username;
    }

    return (
        <Fragment>
            <DynamicForm className="form"
                model={[
                    { key: "sales_project_name", label: "Project Name" },
                    { key: "sales_project_est_rev", currency_key: 'sales_project_est_rev_currency', label: "Estimated Revenue", type: "money", options: currency },
                    { key: "userProfile", label: "Sales Team", type: "m2m", options: personnel, id: "id", name: "username" },
                    { key: "sales_department", label: "Sales Department", type: "fkey", options: department, id: "department_id", name: "department_name" },
                ]}

                addon={[]}

                response={error}

                onSubmit={(data) => { onSubmit(data) }}
            />
        </Fragment>
    )

}


