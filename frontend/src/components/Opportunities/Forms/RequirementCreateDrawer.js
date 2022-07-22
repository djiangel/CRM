import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axiosInstance from '../../../api/axiosApi';
import DynamicForm from '../../Application/DynamicForm';

export default function RequirementCreateDrawer(props) {
    const project = useSelector(state => state.api.project)
    const user_list = useSelector(state => state.api.project.userProfile)
    const [error, setError] = useState([]);
    const dispatch = useDispatch()
    const onSubmit = (data) => {
        let formData = new FormData();
        formData.append('requirements', data.requirements);
        formData.append('sales_project', project.sales_project_id);
        if (data.file) {
            formData.append('file', data.file)
        };
        axiosInstance.post('/customer-requirement/', formData)
            .then(response => {
                props.onClose()
                const user_ids = user_list.map(user => user.id)
                dispatch({
                    type: 'CREATE_NOTIFICATION',
                    id: response.data.requirement_id,
                    targets: user_ids,
                    extra: 'Requirements',
                    subject: 'Project',
                    action: 'created',
                    url_id: project.sales_project_id,
                })
                dispatch({
                    type: 'COMPONENTS',
                    loading: 'requirement',
                    data: response.data.project,
                    fetch: 'project_update',
                    message: 'Successfully created a requirement'
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

                data={[]}

                response={error}

                onSubmit={(data) => { onSubmit(data) }}

            />
        </React.Fragment>
    )
}
