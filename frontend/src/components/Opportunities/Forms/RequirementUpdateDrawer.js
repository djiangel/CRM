import React, { useState, useEffect } from 'react'
import { Drawer, Button, Spin } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import axiosInstance from '../../../api/axiosApi';
import DynamicForm from '../../Application/DynamicForm';
import MoonLoader from "react-spinners/MoonLoader";


export default function RequirementUpdateDrawer(props) {
    const dispatch = useDispatch()
    const [error, setError] = useState([]);
    const [loading, setLoading] = useState(false);
    const user_list = useSelector(state => state.api.project.userProfile)
    const loadingComponent = useSelector(state => state.loading.loadingComponent)
    const requirementData = { ...props.requirement }

    const onSubmit = (data) => {
        let formData = new FormData();
        formData.append('requirements', data.requirements);
        if (data.file && typeof data.file !== 'string') {
            formData.append('file', data.file)
        };
        axiosInstance.patch(`/customer-requirement/${props.requirement.customer_requirement_id}/`, formData)
            .then(response => {
                props.onClose()
                const project_id = props.requirement.sales_project
                const user_ids = user_list.map(user => user.id)
                dispatch({
                    type: 'COMPONENTS',
                    loading: 'requirement',
                    data: response.data,
                    fetch: 'project_update',
                    message: `Successfully updated requirement ${props.requirement.customer_requirement_id}`
                })
                dispatch({
                    type: 'UPDATE_NOTIFICATION',
                    id: props.requirement.customer_requirement_id,
                    url_id: project_id,
                    original: requirementData,
                    final: data,
                    extra: 'Requirements',
                    targets: user_ids,
                    subject: `Project ID ${project_id} / `
                })
            })
            .catch(error => {
                if (error.response) setError(error.response.data)
            })
    };

    return (
        <React.Fragment>
            <DynamicForm className="form"

                model={[
                    { key: "requirements", label: "Requirement Details", type: "text_area" },
                    { key: "file", label: "Attach File", type: "file", blank: true },
                ]}

                addon={[]}

                data={requirementData}

                response={error}

                onSubmit={(data) => { onSubmit(data) }}
            />
        </React.Fragment>
    )
}
