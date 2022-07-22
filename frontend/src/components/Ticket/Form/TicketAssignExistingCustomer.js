
import React, { useState, useEffect, Fragment } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import DynamicForm from '../../Application/DynamicForm';
import axiosInstance from '../../../api/axiosApi';

export default function TicketAssignExistingCustomer(props) {
    const dispatch = useDispatch()
    const [error, setError] = useState([]);
    const [customer, setCustomer] = useState([]);
    const ticket = useSelector(state => state.ticket.ticket)
    useEffect(() => {
        axiosInstance.get('/customer-information/')
            .then(response => {
                setCustomer(response.data);
            });
    }, [])

    const onSubmit = (data) => {
        data['name'] = ticket.name
        data['ticket'] = ticket.id
        data['email'] = ticket.email
        data['phone'] = '+65 92388112'
        axiosInstance.post('ticket/assignexistingcustomer/', data)
            .then(response => {
                dispatch({
                    type: 'TICKET_COMPONENTS',
                    loading: 'ticket',
                    data: response.data,
                    fetch: 'UPDATE_TICKET_DETAILS',
                    message: `Successfully assigned to ${ticket.name}`
                })
                props.onClose()
            })
            .catch(error => {
                if (error.response) setError(error.response.data)
            })
    };

    return (
        <Fragment>

            <DynamicForm className="form"
                model={[
                    { key: "customerInformation", label: "Company", type: "fkey", options: customer, id: "customer_id", name: "customer_name" },
                ]}

                addon={[]}

                response={error}

                onSubmit={(data) => { onSubmit(data) }}
            />
        </Fragment>
    )

}

