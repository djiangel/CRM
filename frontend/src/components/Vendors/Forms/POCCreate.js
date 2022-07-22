import React, { useState, useEffect } from 'react'
import DynamicForm from '../../Application/DynamicForm';
import axiosInstance from '../../../api/axiosApi';
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom';

export default function POCCreate(props) {

    const [error, setError] = useState(null);

    const dispatch = useDispatch()
    const history = useHistory();

    const onSubmit = (data) => {
        data['vendorInformation'] = props.id
        axiosInstance.post('/vendor-poc/', data)
            .then(response => {
                dispatch({
                    type: 'COMPONENTS',
                    loading: 'vendor',
                    data: response.data,
                    fetch: 'vendor_update',
                    message: 'Successfully created a vendor POC'
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
                    { key: "email", label: "Email" },
                    { key: "number", label: "Number", type: "phone_number" },
                ]}

                addon={[]}

                response={error}

                onSubmit={(data) => { onSubmit(data) }}
            />
        </div>
    )
}

