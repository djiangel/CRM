import React, { useState, useEffect } from 'react'
import { Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import DynamicForm from '../../Application/DynamicForm';
import axiosInstance from '../../../api/axiosApi';

export default function QuotationItemCreate(props) {
    const dispatch = useDispatch()
    const user_list = useSelector(state => state.api.project.userProfile)
    const project_id = useSelector(state => state.api.project.sales_project_id)
    const [block, setBlock] = useState([]);
    const [error, setError] = useState([]);

    useEffect(() => {
        axiosInstance.get(`/budget-block/projectblock/?project=${project_id}&date=${props.quotation.due_date}`)
            .then(response => {
                let data = response.data;
                for (let i = 0; i < data.length; i++) {
                    data[i]['detail'] = `${data[i]['start_date']} - ${data[i]['end_date']} / ${data[i].item.item_code} / ${data[i].vendor.vendor_name}`
                }
                setBlock(data);
            });
    }, [])

    const onSubmit = (data) => {
        data['quotation'] = props.quotation.quotation_id
        data['project'] = project_id
        data['type'] = 'PROJECT'
        axiosInstance.post('/quotation-item/', data)
            .then(response => {
                const user_ids = user_list.map(user => user.id)
                dispatch({
                    type: 'CREATE_NOTIFICATION',
                    url_id: data['quotation'],
                    targets: user_ids,
                    extra: 'Quotations',
                    subject: 'Project',
                    action: 'updated with more item(s)',
                    id: project_id
                })

                dispatch({
                    type: 'COMPONENTS',
                    loading: 'quotation',
                    data: response.data,
                    fetch: 'project_update',
                    message: 'Successfully created a quotation item'
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
                    { key: "quantity", label: "Quantity", type: 'number' },
                    { key: "unit_price", label: "Unit Price", type: 'number' },
                    { key: "moq", label: "MOQ", type: 'number' },
                    { key: "mdq", label: "MDQ", type: 'number' },
                    { key: "block", label: "Budget Block", type: "fkey", options: block, id: "block_id", name: "detail" },
                    { key: "remarks", label: "Remarks", blank: true },
                ]}

                addon={[]}


                data={null}

                response={error}

                onSubmit={(data) => { onSubmit(data) }}

            />
        </React.Fragment>
    )

}
