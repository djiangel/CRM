import React, { useState, useEffect } from 'react'
import { Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import DynamicForm from '../../Application/DynamicForm';
import axiosInstance from '../../../api/axiosApi';

export default function QuotationCreateDrawer(props) {
    const dispatch = useDispatch()
    const [error, setError] = useState([]);

    const quotation = { ...props.quotation }
    const id = props.quotation.quotation_id

    const onSubmit = (data) => {
        let formData = new FormData();
        data['type'] = 'CUSTOMER'
        Object.keys(data).forEach((key, index) => {
            if (key === 'file') {
                if (data[key] && typeof data[key] !== 'string') formData.append('file', data.file)
            }
            if (key === 'items') {
                formData.append('items', JSON.stringify(data.items))
            }
            else {
                if (data[key] !== null) formData.append(key, data[key]);
            }
        })
        axiosInstance.patch(`/quotation/${id}/`, data)
            .then(response => {
                dispatch({
                    type: 'COMPONENTS',
                    loading: 'quotation',
                    data: response.data,
                    fetch: 'customer_update',
                    message: `Successfully updated quotation ${id}`
                })
                props.onClose()
            })
            .catch(error => {
                console.log(error)
                if (error.response) setError(error.response.data)
            })
    };

    return (
        <React.Fragment>
            <DynamicForm className="form"
                model={[
                    { key: "document_date", label: "Document Date", type: "date" },
                    { key: "tax_date", label: "Tax Date", type: "date" },
                    { key: "due_date", label: "Due Date", type: "date" },
                    { key: "file", label: "Attach File", type: "file", blank: true },
                    { key: "remarks", label: "Remarks", type: "text_area", blank: true },
                ]}

                addon={[]}


                data={quotation}

                response={error}

                onSubmit={(data) => { onSubmit(data) }}

            />
        </React.Fragment>

    )

}
