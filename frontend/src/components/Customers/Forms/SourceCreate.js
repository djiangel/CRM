import React, { useState, useEffect } from 'react'
import { Drawer, Button, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ItemDrawer from '../../Items/Forms/ItemDrawer';
import { useDispatch, useSelector } from 'react-redux'
import DynamicForm from '../../Application/DynamicForm';
import axiosInstance from '../../../api/axiosApi';

export default function SourceCreate(props) {

    const [error, setError] = useState([]);

    const onSubmit = (data) => {
        axiosInstance.post(`/lead-source/`, data)
            .then(response => {
                if (props.inlineCreate) {
                    props.inlineCreate()
                }
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
                    { key: "source", label: "Source" },
                ]}

                addon={[]}

                data={null}

                response={error}

                onSubmit={(data) => { onSubmit(data) }}
            />
        </React.Fragment >
    )
}