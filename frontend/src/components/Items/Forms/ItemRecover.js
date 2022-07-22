import React, { useState } from 'react'
import { Button } from 'antd';
import axiosInstance from '../../../api/axiosApi';
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom';

export default function ItemRecover(props) {

    const dispatch = useDispatch()
    const [error, setError] = useState(null);
    const history = useHistory()

    const onSubmit = () => {
        let data = {};
        data['status'] = 'active'
        axiosInstance.patch(`/item/${props.id}/`, data)
            .then(response => {
                props.onClose()
                dispatch({
                    type: 'COMPONENTS',
                    loading: 'detail',
                    data: response.data,
                    fetch: 'item_update',
                    message: `Successfully recovered item ${props.id}`
                })
                history.push(`/item/detail/${response.data.item_id}`);
            })
            .catch(error => {
                if (error.response) setError(error.response.data)
            })
    };

    return (
        <React.Fragment>
            <p>Are you sure you want to recover Item ID: {props.id}?</p>
            <Button onClick={() => onSubmit()}>Yes, I'm sure</Button>
        </React.Fragment>
    )
}