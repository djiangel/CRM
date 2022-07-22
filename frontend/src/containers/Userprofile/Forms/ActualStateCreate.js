import React, { useState, useEffect } from 'react'
import { Drawer, Button, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import axiosInstance from '../../../api/axiosApi';
import { useHistory } from 'react-router-dom'
import DynamicForm from '../../../components/Application/DynamicForm';

export default function ActualStateCreate(props) {

    const dispatch = useDispatch()
    const history = useHistory()
    const types = ['Created', 'Converted', 'Deactivated', 'In Production', 'Completed', 'Approved']
    const [states, setStates] = useState([]);
    const [error, setError] = useState([]);
    const [inlineCreate, setInlineCreate] = useState(false);

    useEffect(() => {
        axiosInstance.get('/state/list/')
            .then(response => {
                console.log(response.data);
                setStates(response.data);
            });
    }, [])

    const onSubmit = (data) => {
        console.log(data)
        axiosInstance.post(`/actual-state/`, data)
            .then(response => {
                dispatch({
                    type: 'ADMIN_SETTINGS'
                })
                props.onClose()
            })
            .catch(error => {
                if (error.response) setError(error.response.data)
            })
    }

    return (
        <React.Fragment>
            <DynamicForm className="form"

                model={[
                    { key: "workflow_type", label: "Workflow", type: "select", options: ['Project', 'Customer', 'Vendor', 'Quotation'] },
                    { key: "state_type", label: "Types", type: "select", options: types },
                    { key: "state", label: "State", type: "fkey", options: states, id: "id", name: "label" },
                ]}

                addon={[]}

                data={null}

                response={error}

                onSubmit={(data) => { onSubmit(data) }}
            />
        </React.Fragment >
    )
}