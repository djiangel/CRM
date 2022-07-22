import React, { useState, useEffect, Fragment } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import DynamicForm from '../../Application/DynamicForm';
import axiosInstance from '../../../api/axiosApi';
import CustomerDrawer from '../../Customers/Forms/CustomerDrawer';

export default function TicketAssignNewCustomer(props) {
    const dispatch = useDispatch()
    const [error, setError] = useState([]);
    const [department, setDepartment] = useState([]);
    const [sources, setSource] = useState([]);
    const [country, setCountry] = useState([]);
    const [inlineCreate, setInlineCreate] = useState(false);
    const ticket = useSelector(state => state.ticket.ticket)

    useEffect(() => {
        axiosInstance.get('/sales-department/')
            .then(response => {
                setDepartment(response.data);
            });
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
        data['pocs'] = [{
            name: ticket.name,
            email: ticket.email,
            phone: ticket.phone,
        }]
        data['ticket'] = ticket.id
        axiosInstance.post('ticket/assignnewcustomer/', data)
            .then(response => {
                dispatch({
                    type: 'TICKET_COMPONENTS',
                    loading: 'ticket',
                    data: response.data,
                    fetch: 'UPDATE_TICKET_CUSTOMER',
                    message: `Successfully assigned to ${ticket.name}`
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
        <Fragment>
            <DynamicForm className="form"
                model={[
                    { key: "customer_name", label: "Customer Name" },
                    { key: "telephone_number", label: "Telephone Number", blank: true },
                    { key: "fax_number", label: "Fax Number", blank: true },
                    { key: "country", label: "Country", type: "fkey", options: country, id: "value", name: "display_name" },
                    { key: "address", label: "Address", type: "text_area" },
                    { key: "source", label: "Lead Source", type: "fkey", options: sources, id: "source_id", name: "source", add: sourceAdd },
                    { key: "salesDepartment", label: "Sales Department", type: "fkey", options: department, id: "department_id", name: "department_name" },
                ]}
                addon={[]}

                response={error}

                onSubmit={(data) => { onSubmit(data) }}
            />
        </Fragment>
    )

}


