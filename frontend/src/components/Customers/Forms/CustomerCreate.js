import React, { useState, useEffect } from 'react'
import DynamicForm from '../../Application/DynamicForm';
import axiosInstance from '../../../api/axiosApi';
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom';
import CustomerDrawer from './CustomerDrawer';

export default function CustomerCreate(props) {

    const [department, setDepartment] = useState([]);
    const [country, setCountry] = useState([]);
    const [source, setSource] = useState([]);
    const [error, setError] = useState(null);
    const [inlineCreate, setInlineCreate] = useState(false);

    const dispatch = useDispatch()
    const history = useHistory();

    useEffect(() => {
        axiosInstance.get('/sales-department/')
            .then(response => {
                setDepartment(response.data);
            });
        axiosInstance.options('/customer-information/')
            .then(response => {
                setCountry(response.data.actions.POST.country.choices);
            });
        axiosInstance.get('/lead-source/')
            .then(response => {
                setSource(response.data);
            });
    }, [])

    useEffect(() => {
        axiosInstance.get('/lead-source/')
            .then(response => {
                setSource(response.data);
            });
    }, [inlineCreate])


    const onSubmit = (data) => {
        axiosInstance.post('/customer-information/', data)
            .then(response => {
                const user_list = response.data.authorized_users.map(user => user.id)
                dispatch({
                    type: 'CREATE_NOTIFICATION',
                    id: response.data.customer_id,
                    targets: user_list,
                    extra: 'Customer',
                    action: 'created'
                })
                dispatch({
                    type: 'COMPONENTS',
                    loading: 'customer',
                    data: response.data,
                    fetch: 'customer_update',
                    message: 'Successfully created a customer'
                })
                if (props.redirect) history.push(`/customer/detail/${response.data.customer_id}`);
                else props.onClose()
            })
            .catch(error => {
                if (error.response) setError(error.response.data)
            })
    };

    const sourceAdd = <CustomerDrawer
        inlineCreate={() => setInlineCreate(!inlineCreate)}
        button_name='Create Source'
        title='Create Source'
        component='SourceCreate'
        button_type='create_only'
        button_style='primary'
        button_shape='circle' />

    return (
        <div>
            <DynamicForm className="form"
                model={[
                    { key: "customer_name", label: "Customer Name" },
                    { key: "telephone_number", label: "Telephone Number", type: "phone_number", blank: true },
                    { key: "fax_number", label: "Fax Number", type: "phone_number", blank: true },
                    { key: "country", label: "Country", type: "fkey", options: country, id: "value", name: "display_name" },
                    { key: "address", label: "Address", type: "text_area" },
                    { key: "source", label: "Lead Source", type: "fkey", options: source, id: "source_id", name: "source", add: sourceAdd },
                    { key: "salesDepartment", label: "Sales Department", type: "fkey", options: department, id: "department_id", name: "department_name" },
                ]}

                addon={[
                    {
                        model: 'pocs',
                        fields:
                            [{ key: "name", label: "POC Name" },
                            { key: "email", label: "POC Email", blank: true },
                            { key: "number", label: "POC Number", type: "phone_number", blank: true }]

                    }
                ]}

                response={error}

                onSubmit={(data) => { onSubmit(data) }}
            />
        </div>
    )
}

