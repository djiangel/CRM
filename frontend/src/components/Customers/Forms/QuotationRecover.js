import React, { useState, useEffect } from 'react'
import { Drawer, Button, Spin } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import axiosInstance from '../../../api/axiosApi';


export default function QuotationRecover(props) {
    const dispatch = useDispatch()

    const onSubmit = () => {
        let data = {};
        data['status'] = 'active'
        axiosInstance.patch(`/quotation/${props.id}/setinactive/`, data)
            .then(response => {
                dispatch({
                    type: 'COMPONENTS',
                    loading: 'quotation',
                    data: response.data,
                    fetch: 'customer_update',
                    message: `Successfully recovered quotation ${props.id}`
                })
                props.onClose()
            })
            .catch(error => {
                console.log(error)
            })
    };

    return (
        <React.Fragment>
            <p>Are you sure you want to recover Quotation ID: {props.id}?</p>
            <Button onClick={() => onSubmit()}>Yes, I'm sure</Button>
        </React.Fragment>
    )
}

