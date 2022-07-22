import React, { useState } from 'react'
import axiosInstance from '../../../api/axiosApi';
import { Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux'

export default function CompetitorItemRecover(props) {

    const dispatch = useDispatch()
    const [error, setError] = useState(null);

    const onSubmit = () => {
        let data = {};
        data['status'] = 'active'
        axiosInstance.patch(`/competitor-item/${props.id}/`, data)
            .then(response => {
                props.onClose()
                dispatch({
                    type: 'COMPONENTS',
                    loading: 'competitor',
                    data: response.data,
                    fetch: 'item_update',
                    message: `Successfully recovered competitor item ${props.id}`
                })
            })
            .catch(error => {
                if (error.response) setError(error.response.data)
            })
    };

    return (
        <React.Fragment>
            <p>Are you sure you want to recover Competitor Item ID: {props.id}?</p>
            <Button onClick={() => onSubmit()}>Yes, I'm sure</Button>
        </React.Fragment>
    )
}