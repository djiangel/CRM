
import React, { useState, useEffect, Fragment } from 'react'
import { useDispatch } from 'react-redux'
import DynamicForm from '../../Application/DynamicForm';
import axiosInstance from '../../../api/axiosApi';
import { useHistory } from 'react-router-dom';

export default function CustomTicketCreate(props) {
    const dispatch = useDispatch()
    const [error, setError] = useState([]);
    const [poc, setPoc] = useState([]);
    const history = useHistory();

    useEffect(() => {
        axiosInstance.get('/ticket/getpoc/')
            .then(response => {
                setPoc(response.data);
            });
    }, [])

    const onSubmit = (data) => {
        data.source = "others"
        axiosInstance.post('/ticket/', data)
            .then(response => {
                dispatch({
                    type: 'TICKET_COMPONENTS',
                    loading: 'ticket',
                    data: response.data,
                    fetch: 'UPDATE_TICKET_LIST',
                    message: 'Successfully created a Ticket'
                })
                props.onClose()
                history.push(`/ticket/detail/${response.data.id}`);
            })
            .catch(error => {
                if (error.response) setError(error.response.data)
            })
    };

    return (
        <Fragment>
            <DynamicForm className="form"
                model={[
                    { key: "customerPoc", label: "Customer POC", type: "fkey", options: poc, id: "poc_id", name: "name" },
                    { key: "nature", label: "Nature", type: "select", options: ['complain', 'enquiry', 'experdite'] },
                    { key: "priority", label: "Priority", type: "select", options: ['important', 'medium', 'normal'] },
                    { key: "title", label: "Title" },
                    { key: "content", label: "Content" },
                ]}

                addon={[]}

                response={error}

                addonData={[]}

                onSubmit={(data) => { onSubmit(data) }}
            />
        </Fragment>
    )

}
