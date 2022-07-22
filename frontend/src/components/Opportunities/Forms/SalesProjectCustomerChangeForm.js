
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axiosInstance from '../../../api/axiosApi';
import DynamicForm from '../../Application/DynamicForm';
import { List, Tag } from 'antd';

export default function SalesProjectCustomerChangeForm(props) {
    const [error, setError] = useState([]);
    const [customerOptions, setCustomer] = useState([]);
    const user_list = useSelector(state => state.api.project.userProfile)
    const current_customer = useSelector(state => state.api.project.customerInformation)
    const project_id = useSelector(state => state.api.project.sales_project_id)
    const dispatch = useDispatch()

    useEffect(() => {
        axiosInstance.get(`/sales-project/${project_id}/getexternalcustomers/`)
            .then(response => {
                setCustomer(response.data)
            });
    }, [])

    const onSubmit = (data) => {
        data['type'] = 'ADD'
        axiosInstance.patch(`/sales-project/${project_id}/`, data)
            .then(response => {
                const user_ids = user_list.map(user => user.id)
                dispatch({
                    type: 'CREATE_NOTIFICATION',
                    id: response.data.sales_project_id,
                    targets: user_ids,
                    extra: 'Project/Customer',
                    action: `${response.data.customerInformation.customer_name}`
                })
                dispatch({
                    type: 'COMPONENTS',
                    loading: 'customer',
                    data: response.data,
                    fetch: 'project_update',
                    message: `Successfully added customer(s)`
                })
                props.onClose()
            })
            .catch(error => {
                if (error.response) setError(error.response.data)
            })
    };

    return (
        <React.Fragment>

            <Tag>{current_customer.customer_name}</Tag>
            {customerOptions ?
                <DynamicForm className="form"

                    model={[
                        { key: "customerInformation", label: "Customers", type: "fkey", options: customerOptions, id: "customer_id", name: "customer_name" },
                    ]}
                    addon={[]}
                    response={error}

                    onSubmit={(data) => { onSubmit(data) }}
                /> : null}
        </React.Fragment>
    )
}
