import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axiosInstance from '../../../api/axiosApi';
import DynamicForm from '../../Application/DynamicForm';

export default function SalesProjectUpdateDrawer(props) {
    const dispatch = useDispatch()
    const [error, setError] = useState({});

    const reducedProject = {
        ...props.project,
        'customerInformation': props.project.customerInformation.customer_id,
        'userProfile': props.project.userProfile.map(user => user.id),
        'sales_department': props.project.sales_department.department_id,
    }

    const onSubmit = (data) => {
        axiosInstance.patch(`/sales-project/${props.project.sales_project_id}/`, data)
            .then(response => {
                dispatch({
                    type: 'UPDATE_NOTIFICATION',
                    id: props.project.sales_project_id,
                    original: reducedProject,
                    final: data,
                    extra: 'Sales Project',
                    targets: props.project['userProfile'].map(user => user.id)
                })
                dispatch({
                    type: 'COMPONENTS',
                    loading: 'salesproject',
                    data: response.data,
                    fetch: 'project_update',
                    message: 'Successfully update the project'
                })
                props.onClose()

            })
            .catch(error => {
                if (error.response) setError(error.response.data)
            })
    };

    return (
        <React.Fragment>
            <DynamicForm className="form"
                model={[
                    { key: "sales_project_name", label: "Project Name" },
                    { key: "sales_project_est_rev", label: "Estimated Revenue" },
                ]}
                addon={[]}

                data={reducedProject}

                response={error}

                onSubmit={(data) => { onSubmit(data) }}
            />
        </React.Fragment>
    )
}
