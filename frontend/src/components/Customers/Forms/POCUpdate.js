import React, { useState, useEffect } from 'react'
import DynamicForm from '../../Application/DynamicForm';
import axiosInstance from '../../../api/axiosApi';
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom';

export default function CustomerCreate(props) {

    const [error, setError] = useState(null);

    const dispatch = useDispatch()
    const history = useHistory();

    const poc = { ...props.poc }

    const onSubmit = (data) => {
        axiosInstance.patch(`/customer-poc/${props.poc.poc_id}/`, data)
            .then(response => {
                dispatch({
                    type: 'COMPONENTS',
                    loading: 'customer',
                    data: response.data,
                    fetch: 'customer_update',
                    message: 'Successfully created a customer POC'
                })
                props.onClose()
            })
            .catch(error => {
                if (error.response) setError(error.response.data)
            })
    };

    return (
        <div>
            <DynamicForm className="form"
                model={[
                    { key: "name", label: "Name" },
                    { key: "email", label: "Email", blank: true },
                    { key: "number", label: "Number", type: "phone_number", blank: true },
                ]}

                addon={[]}

                data={poc}

                response={error}

                onSubmit={(data) => { onSubmit(data) }}
            />
        </div>
    )
}

