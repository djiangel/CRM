import React, { useState } from 'react'
import axiosInstance from '../../../api/axiosApi';
import { Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux'

export default function CompetitorItemDelete(props) {

    const dispatch = useDispatch()
    const [error, setError] = useState(null);

    const onSubmit = () => {
        let data = {};
        data['status'] = 'inactive'
        axiosInstance.patch(`/competitor-item/${props.id}/`, data)
            .then(response => {
                props.onClose()
                dispatch({
                    type: 'COMPONENTS',
                    loading: 'competitor',
                    data: response.data,
                    fetch: 'item_update',
                    message: `Successfully deleted competitor item ${props.id}`
                })
            })
            .catch(error => {
                if (error.response) setError(error.response.data)
            })
    };

    return (
        <React.Fragment>
            <p>Are you sure you want to delete Competitor Item ID: {props.id}?</p>
            <Button onClick={() => onSubmit()}>Yes, I'm sure</Button>
            <small>Disclaimer: This is a soft delete, and you will be able to recover the Competitor Item at any point in time.</small>
        </React.Fragment>
    )
}