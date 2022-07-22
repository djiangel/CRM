import React, { useState, useEffect } from 'react'
import { Drawer, Button, Spin } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import axiosInstance from '../../../api/axiosApi';
import DynamicForm from '../../Application/DynamicForm';


export default function QuotationUpdateDrawer(props) {
    const dispatch = useDispatch()
    const user_list = useSelector(state => state.api.project.userProfile)
    const project_id = useSelector(state => state.api.project.sales_project_id)
    const [error, setError] = useState([]);

    //Preparing the props.quotation so that fkeys and m2m can enter as list of ids
    const quotation = { ...props.quotation }
    const id = props.quotation.quotation_id


    const onSubmit = (data) => {
        delete data['salesProject']
        let formData = new FormData();
        Object.keys(data).forEach((key, index) => {
            if (key === 'file') {
                if (data[key] && typeof data[key] !== 'string') formData.append('file', data.file)
            } else {
                if (data[key] !== null) formData.append(key, data[key]);
            }
        })
        data['type'] = 'PROJECT'
        formData.append('type', 'PROJECT')
        axiosInstance.patch(`/quotation/${id}/`, formData)
            .then(response => {
                const user_ids = user_list.map(user => user.id)
                dispatch({
                    type: 'UPDATE_NOTIFICATION',
                    id: id,
                    original: quotation,
                    final: data,
                    extra: 'Quotations',
                    targets: user_ids,
                    subject: `Project ID : ${project_id} / `
                })
                dispatch({
                    type: 'COMPONENTS',
                    loading: 'quotation',
                    data: response.data,
                    fetch: 'project_update',
                    message: `Successfully updated quotation ${id}`
                })
                props.onClose()
            })
            .catch(error => {
                console.log(error.response)
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

