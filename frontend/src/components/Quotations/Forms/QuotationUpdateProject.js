import React, { useState, useEffect } from 'react'
import { Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import DynamicForm from '../../Application/DynamicForm';
import axiosInstance from '../../../api/axiosApi';

export default function QuotationUpdateProject(props) {
    const dispatch = useDispatch()
    const user_list = useSelector(state => state.api.project.userProfile)
    const [error, setError] = useState([]);

    const quotation = { ...props.quotation }

    const onSubmit = (data) => {
        let formData = new FormData();
        data['type'] = 'QUOTATION'
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
        axiosInstance.patch(`/quotation/${props.quotation.quotation_id}/`, data)
            .then(response => {
                const user_ids = response.data.user_list.map(user => user.id)
                dispatch({
                    type: 'UPDATE_NOTIFICATION',
                    id: props.quotation.quotation_id,
                    original: quotation,
                    final: data,
                    extra: 'Quotations',
                    targets: user_ids,
                    subject: `Project ID : ${props.quotation.salesProject.sales_project_id} / `
                })
                dispatch({
                    type: 'QUOTATION_UPDATE',
                    data: response.data.quotation,
                    message: `Successfully updated quotation ${props.quotation.quotation_id}`
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
