import React, { useState, useEffect } from 'react'
import { Drawer, Button, Spin } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import axiosInstance from '../../../api/axiosApi';

export default function ForecastDelete(props) {
    const dispatch = useDispatch()
    const user_list = useSelector(state => state.api.project.userProfile)

    const onSubmit = () => {
        let data = {};
        data['status'] = 'inactive'
        axiosInstance.patch(`/revenue-forecast/${props.id}/`, data)
            .then(response => {
                const user_ids = user_list.map(user => user.id)
                dispatch({
                    type: 'CREATE_NOTIFICATION',
                    id: response.data.forecast_id,
                    targets: user_ids,
                    extra: 'Forecast',
                    subject: 'Project',
                    action: 'deleted',
                    url_id: response.data.project.sales_project_id,
                })
                dispatch({
                    type: 'COMPONENTS',
                    loading: 'forecast',
                    data: response.data.project,
                    fetch: 'project_update',
                    message: `Successfully deleted revenue forecast ${props.id}`
                })
                props.onClose()
            })
            .catch(error => {
                console.log(error)
            })
    };

    return (
        <React.Fragment>
            <p>Are you sure you want to delete Revenue Forecast ID: {props.id}?</p>
            <Button onClick={() => onSubmit()}>Yes, I'm sure</Button>
            <small>Disclaimer: This is a permanent delete, and you will NOT be able to recover this Revenue Forecast in future.</small>
        </React.Fragment>
    )
}
