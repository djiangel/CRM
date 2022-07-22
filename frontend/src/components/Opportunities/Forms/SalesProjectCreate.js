import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'
import axiosInstance from '../../../api/axiosApi';
import DynamicForm from '../../Application/DynamicForm';

export default function SalesProjectCreate(props) {
    const history = useHistory();
    const [error, setError] = useState([]);
    const [personnel, setPersonnel] = useState([]);
    const [customer, setCustomer] = useState([]);
    const [department, setDepartment] = useState([]);
    const [currency, setCurrency] = useState([]);
    const dispatch = useDispatch()

    useEffect(() => {
        axiosInstance.get('/user-profile/')
            .then(response => {
                setPersonnel(response.data)
            });
        axiosInstance.get('/customer-information/')
            .then(response => {
                setCustomer(response.data);
            });
        axiosInstance.get('/sales-department/')
            .then(response => {
                setDepartment(response.data);
            });
        axiosInstance.get('/sales-project/getcurrencies/')
            .then(response => {
                setCurrency(response.data);
            });
    }, [])

    const onSubmit = (data) => {
        axiosInstance.post('sales-project/', data)
            .then(response => {
                dispatch({
                    type: 'CREATE_NOTIFICATION',
                    id: response.data.sales_project_id,
                    targets: data.userProfile,
                    extra: 'Sales Project',
                    action: 'created'
                })
                props.onClose()
                history.push(`/project/detail/${response.data.sales_project_id}`);
            })
            .catch(error => {
                if (error.response) setError(error.response.data)
            })
    };

    for (var i = 0; i < personnel.length; i++) {
        personnel[i]['username'] = personnel[i].user.username;
    }

    return (
        <React.Fragment>
            <DynamicForm className="form"
                model={[
                    { key: "sales_project_name", label: "Project Name" },
                    { key: "sales_project_est_rev", currency_key: 'sales_project_est_rev_currency', label: "Estimated Revenue", type: "money", options: currency },
                    { key: "customerInformation", label: "Customer Information", type: "fkey", options: customer, id: "customer_id", name: "customer_name" },
                    { key: "userProfile", label: "Sales Team", type: "m2m", options: personnel, id: "id", name: "username" },
                    { key: "sales_department", label: "Sales Department", type: "fkey", options: department, id: "department_id", name: "department_name" },
                ]}

                addon={[]}

                response={error}

                onSubmit={(data) => { onSubmit(data) }}
            />
        </React.Fragment>
    )
}
