import React, { useState, useEffect } from 'react'
import DynamicForm from '../../Application/DynamicForm';
import { useDispatch, useSelector } from 'react-redux'
import axiosInstance from '../../../api/axiosApi';
import CustomerDrawer from './CustomerDrawer';

export default function CustomerCreate(props) {

    const [country, setCountry] = useState([]);
    const [source, setSource] = useState([]);
    const [error, setError] = useState(null);
    const [inlineCreate, setInlineCreate] = useState(false);

    const dispatch = useDispatch()

    const customer = {
        ...props.customer,
        'country': props.customer.country.code,
        'source': props.customer.source.source_id,
    }

    useEffect(() => {
        axiosInstance.options('/customer-information/')
            .then(response => {
                setCountry(response.data.actions.POST.country.choices);
            });
    }, [])

    useEffect(() => {
        axiosInstance.get('/lead-source/')
            .then(response => {
                setSource(response.data);
            });
    }, [inlineCreate])


    const onSubmit = (data) => {
        axiosInstance.patch(`/customer-information/${props.customer.customer_id}/`, data)
            .then(response => {
                const user_list = response.data.authorized_users.map(user => user.id)
                dispatch({
                    type: 'UPDATE_NOTIFICATION',
                    id: props.customer.customer_id,
                    original: customer,
                    final: data,
                    extra: 'Customer',
                    targets: user_list
                })
                dispatch({
                    type: 'COMPONENTS',
                    loading: 'customer',
                    data: response.data,
                    fetch: 'customer_update',
                    message: 'Successfully updated a customer'
                })
                props.onClose()
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
        button_shape='circle'
        button_style='primary' />

    return (
        <div>
            <DynamicForm className="form"
                model={[
                    { key: "customer_name", label: "Customer Name" },
                    { key: "telephone_number", label: "Telephone Number", blank: true },
                    { key: "fax_number", label: "Fax Number", blank: true },
                    { key: "country", label: "Country", type: "fkey", options: country, id: "value", name: "display_name" },
                    { key: "address", label: "Address", type: "text_area" },
                    { key: "source", label: "Lead Source", type: "fkey", options: source, id: "source_id", name: "source", add: sourceAdd },
                ]}

                addon={[]}

                data={customer}

                response={error}

                onSubmit={(data) => { onSubmit(data) }}
            />
        </div>
    )
}

