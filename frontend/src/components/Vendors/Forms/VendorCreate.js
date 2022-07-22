import React, { useState, useEffect } from 'react'
import DynamicForm from '../../Application/DynamicForm';
import axiosInstance from '../../../api/axiosApi';
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom';

export default function VendorCreate(props) {

    const [department, setDepartment] = useState([]);
    const [country, setCountry] = useState([]);
    const [source, setSource] = useState([]);
    const [error, setError] = useState(null);

    const dispatch = useDispatch()
    const history = useHistory();

    useEffect(() => {
        axiosInstance.get('/sales-department/')
            .then(response => {
                setDepartment(response.data);
            });
        axiosInstance.options('/vendor-information/')
            .then(response => {
                setCountry(response.data.actions.POST.country.choices);
            });
    }, [])


    const onSubmit = (data) => {
        axiosInstance.post('/vendor-information/', data)
            .then(response => {
                dispatch({
                    type: 'COMPONENTS',
                    loading: 'vendor',
                    data: response.data,
                    fetch: 'vendor_update',
                    message: 'Successfully created a vendor'
                })
                if (props.redirect) history.push(`/vendor/detail/${response.data.vendor_id}`);
                else if (props.inlineCreate) props.inlineCreate()
                props.onClose()
            })
            .catch(error => {
                if (error.response) setError(error.response.data)
            })
    };

    return (
        <div>
            <DynamicForm className="form"
                model={[
                    { key: "vendor_name", label: "Vendor Name" },
                    { key: "telephone_number", label: "Telephone Number", type: "phone_number", blank: true },
                    { key: "fax_number", label: "Fax Number", type: "phone_number", blank: true },
                    { key: "country", label: "Country", type: "fkey", options: country, id: "value", name: "display_name" },
                    { key: "address", label: "Address", type: "text_area" },
                    { key: "salesDepartment", label: "Sales Department", type: "fkey", options: department, id: "department_id", name: "department_name" },
                ]}

                addon={[
                    {
                        model: 'pocs',
                        fields:
                            [{ key: "name", label: "POC Name" },
                            { key: "email", label: "POC Email", blank: true },
                            { key: "number", label: "POC Number", type: 'phone_number', blank: true }]

                    }
                ]}

                response={error}

                onSubmit={(data) => { onSubmit(data) }}
            />
        </div>
    )
}

