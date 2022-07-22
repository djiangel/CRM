import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axiosInstance from '../../../api/axiosApi';
import DynamicForm from '../../Application/DynamicForm';

export default function TicketUpdate(props) {
    const dispatch = useDispatch()
    const [error, setError] = useState({});
    const ticket = useSelector(state => state.ticket.ticket)
    const ticket_data = { ...ticket }
    const onSubmit = (data) => {
        axiosInstance.patch(`/ticket/${ticket.id}/`, data)
            .then(response => {
                if (ticket.salesProject) {
                    dispatch({
                        type: 'UPDATE_NOTIFICATION',
                        id: ticket.id,
                        original: ticket_data,
                        final: data,
                        extra: 'Ticket',
                        targets: ticket.salesProject.userProfile.map(user => user.id)
                    })
                }
                dispatch({
                    type: 'TICKET_COMPONENTS',
                    loading: 'ticket',
                    data: response.data,
                    fetch: 'UPDATE_TICKET_DETAILS',
                    message: `Successfully updated ticket`
                })

                props.onClose()

            })
            .catch(error => {
                if (error.response) setError(error.response.data)
            })
    };
    return (
        < React.Fragment >
            <DynamicForm className="form"
                model={[
                    { key: "nature", label: "Nature", type: "select", options: ['complain', 'enquiry', 'experdite'] },
                    { key: "priority", label: "Priority", type: "select", options: ['important', 'medium', 'normal'] },
                    { key: "title", label: "Title" },
                    { key: "content", label: "Description" },
                ]}
                addon={[]}

                data={ticket_data}

                response={error}

                onSubmit={(data) => { onSubmit(data) }}
            />
        </React.Fragment >
    )
}
