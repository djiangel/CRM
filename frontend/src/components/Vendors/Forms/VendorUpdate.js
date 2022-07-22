import React, { useState, useEffect } from 'react'
import DynamicForm from '../../Application/DynamicForm';
import { useDispatch, useSelector } from 'react-redux'
import axiosInstance from '../../../api/axiosApi';

export default function VendorUpdate(props) {

    const [country, setCountry] = useState([]);
    const [error, setError] = useState(null);

    const dispatch = useDispatch()

    const vendor = {
        ...props.vendor,
        'country': props.vendor.country.code,
    }

    useEffect(() => {
        axiosInstance.options('/vendor-information/')
            .then(response => {
                setCountry(response.data.actions.POST.country.choices);
            });
    }, [])


    const onSubmit = (data) => {
        axiosInstance.patch(`/vendor-information/${props.vendor.vendor_id}/`, data)
            .then(response => {
                dispatch({
                    type: 'COMPONENTS',
                    loading: 'vendor',
                    data: response.data,
                    fetch: 'vendor_update',
                    message: 'Successfully updated a vendor'
                })
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
                    { key: "telephone_number", label: "Telephone Number", blank: true },
                    { key: "fax_number", label: "Fax Number", blank: true },
                    { key: "country", label: "Country", type: "fkey", options: country, id: "value", name: "display_name" },
                    { key: "address", label: "Address", type: "text_area" },
                ]}

                addon={[]}

                data={vendor}

                response={error}

                onSubmit={(data) => { onSubmit(data) }}
            />
        </div>
    )
}

