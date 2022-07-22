import React, { useState, useEffect } from 'react'
import { Drawer, Button, Spin } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import axiosInstance from '../../../api/axiosApi';


export default function BudgetBlockDeleteDrawer(props) {
    const dispatch = useDispatch()
    const user_list = useSelector(state => state.api.project.userProfile)
    const project_id = useSelector(state => state.api.project.sales_project_id)
    const [error, setError] = useState(null);

    const onSubmit = () => {
        let data = {};
        data['type'] = 'PROJECT'
        data['status'] = 'inactive'
        axiosInstance.patch(`/budget-block/${props.id}/delete/`, data)
            .then(response => {
                const user_ids = user_list.map(user => user.id)
                dispatch({
                    type: 'CREATE_NOTIFICATION',
                    id: props.id,
                    targets: user_ids,
                    extra: 'Project Item',
                    subject: 'Project',
                    action: 'deleted',
                    url_id: project_id,
                })
                dispatch({
                    type: 'COMPONENTS',
                    loading: 'block',
                    data: response.data,
                    fetch: 'project_update',
                    message: `Successfully deleted project item ${props.id}`
                })
                props.onClose()
            })
            .catch(error => {
                console.log(error)
                setError('This Budget Block cannot be deleted as there are Quotations within this Project that uses this Budget Block. In order to delete this Budget Block, all usage of this Budget Block within this Project\'s Quotations have to be removed!')
            })
    };

    return (
        <React.Fragment>
            <p>Are you sure you want to delete Project Item ID: {props.id}?</p>
            <Button onClick={() => onSubmit()}>Yes, I'm sure</Button>
            <small>Disclaimer: You will not be able to restore this Budget Block and deletion will be permanent!</small>
            <p>{error}</p>
        </React.Fragment>
    )
}

