import React, { useState, useEffect } from 'react'
import { Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import DynamicForm from '../../Application/DynamicForm';
import axiosInstance from '../../../api/axiosApi';

export default function QuotationAssign(props) {
    const dispatch = useDispatch()
    const user_list = useSelector(state => state.api.project.userProfile)
    const [projects, setProject] = useState([]);
    const [error, setError] = useState([]);

    useEffect(() => {
        axiosInstance.get(`/sales-project/`)
            .then(response => {
                setProject(response.data);
            });
    }, [])

    const onSubmit = (data) => {
        axiosInstance.patch(`/quotation/${props.id}/assignfromcustomer/`, data)
            .then(response => {
                const user_list = response.data.targets.map(user => user.id)
                dispatch({
                    type: 'CREATE_NOTIFICATION',
                    id: data['salesProject'],
                    targets: user_list,
                    extra: 'Quotations',
                    subject: 'Project',
                    action: 'assigned',
                    url_id: props.id
                })
                dispatch({
                    type: 'COMPONENTS',
                    loading: 'quotation',
                    data: response.data.customer,
                    fetch: 'customer_update',
                    message: `Successfully assigned quotation ${props.id} to project ${data['salesProject']}`
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
                    { key: "salesProject", label: "Project", type: "fkey", options: projects, id: "sales_project_id", name: "sales_project_name" },
                ]}

                addon={[]}

                data={null}

                response={error}

                onSubmit={(data) => { onSubmit(data) }}

            />
        </React.Fragment>

    )

}
