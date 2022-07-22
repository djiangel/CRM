import React, { useState, useEffect } from 'react'
import { Drawer, Button, Spin } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import axiosInstance from '../../../api/axiosApi';


export default function NotationDelete(props) {
    const dispatch = useDispatch()
    const user_list = useSelector(state => state.api.project.userProfile)
    const project_id = useSelector(state => state.api.project.sales_project_id)

    const onSubmit = () => {
        axiosInstance.delete(`/sales-notation/${props.id}/`)
            .then(response => {
                const user_ids = user_list.map(user => user.id)
                dispatch({
                    type: 'CREATE_NOTIFICATION',
                    id: project_id,
                    targets: user_ids,
                    extra: 'Notations',
                    action: 'deleted'
                })
                dispatch({
                    type: 'COMPONENTS',
                    loading: 'notation',
                    data: response.data,
                    fetch: 'project_update',
                    message: `Successfully deleted notation ${props.id}`
                })
                props.onClose()
            })
            .catch(error => {
                console.log(error)
            })
    };

    return (
        <React.Fragment>
            <p>Are you sure you want to delete Notation ID: {props.id}?</p>
            <Button onClick={() => onSubmit()}>Yes, I'm sure</Button>
            <small>Disclaimer: This is a permanent delete, and you will NOT be able to recover this Notation.</small>
        </React.Fragment>
    )
}

