import React, { useState, useEffect } from 'react'
import { Drawer, Button, Spin } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import axiosInstance from '../../../api/axiosApi';


export default function RequirementDelete(props) {
    const dispatch = useDispatch()
    const user_list = useSelector(state => state.api.project.userProfile)
    const project_id = useSelector(state => state.api.project.sales_project_id)

    const onSubmit = () => {
        let data = {};
        data['status'] = 'inactive'
        axiosInstance.patch(`/customer-requirement/${props.id}/`, data)
            .then(response => {
                const user_ids = user_list.map(user => user.id)
                dispatch({
                    type: 'CREATE_NOTIFICATION',
                    id: props.id,
                    targets: user_ids,
                    extra: 'Requirements',
                    subject: 'Project',
                    action: 'deleted',
                    url_id: project_id,
                })
                dispatch({
                    type: 'COMPONENTS',
                    loading: 'requirement',
                    data: response.data,
                    fetch: 'project_update',
                    message: `Successfully deleted requirement ${props.id}`
                })
                props.onClose()
            })
            .catch(error => {
                console.log(error.response)
            })
    };

    return (
        <React.Fragment>
            <p>Are you sure you want to delete Requirement ID: {props.id}?</p>
            <Button onClick={() => onSubmit()}>Yes, I'm sure</Button>
            <small>Disclaimer: This is a soft delete, and you will be able to recover the Requirement at any point in time.</small>
        </React.Fragment>
    )
}