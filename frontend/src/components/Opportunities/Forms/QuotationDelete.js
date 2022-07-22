import React, { useState, useEffect } from 'react'
import { Drawer, Button, Spin } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import axiosInstance from '../../../api/axiosApi';


export default function QuotationDelete(props) {
    const dispatch = useDispatch()
    const user_list = useSelector(state => state.api.project.userProfile)
    const project_id = useSelector(state => state.api.project.sales_project_id)

    const onSubmit = () => {
        let data = {};
        data['type'] = 'QUOTATION'
        data['status'] = 'inactive'
        axiosInstance.patch(`/quotation/${props.id}/setinactive/`, data)
            .then(response => {
                console.log(response.data)
                const user_ids = user_list.map(user => user.id)
                dispatch({
                    type: 'CREATE_NOTIFICATION',
                    id: project_id,
                    targets: user_ids,
                    extra: 'Quotations',
                    subject: 'Project',
                    action: 'deleted',
                    url_id: props.id
                })
                dispatch({
                    type: 'COMPONENTS',
                    loading: 'quotation',
                    data: response.data,
                    fetch: 'project_update',
                    message: `Successfully deleted quotation ${props.id}`
                })
                props.onClose()
            })
            .catch(error => {
                console.log(error)
            })
    };

    return (
        <React.Fragment>
            <p>Are you sure you want to delete Quotation ID: {props.id}?</p>
            <Button onClick={() => onSubmit()}>Yes, I'm sure</Button>
            <small>Disclaimer: This is a soft delete, and you will be able to recover the Quotation at any point in time.</small>
        </React.Fragment>
    )
}

