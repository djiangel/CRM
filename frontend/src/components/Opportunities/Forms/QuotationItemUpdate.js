import React, { useState, useEffect } from 'react'
import { Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import DynamicForm from '../../Application/DynamicForm';
import axiosInstance from '../../../api/axiosApi';

export default function QuotationItemUpdate(props) {
    const dispatch = useDispatch()
    const user_list = useSelector(state => state.api.project.userProfile)
    const project_id = useSelector(state => state.api.project.sales_project_id)
    const [block, setBlock] = useState([]);
    const [error, setError] = useState([]);

    useEffect(() => {
        axiosInstance.get(`/budget-block/projectblock/?project=${project_id}&date=${props.data.due_date}`)
            .then(response => {
                let data = response.data;
                for (let i = 0; i < data.length; i++) {
                    data[i]['detail'] = `${data[i]['start_date']} - ${data[i]['end_date']} / ${data[i].item.item_code} / ${data[i].vendor.vendor_name}`
                }
                setBlock(data);
            });
    }, [])

    const quotation_item = { ...props.data.quotation_item, 'block': props.data.quotation_item.block.block_id }

    const onSubmit = (data) => {
        data['type'] = 'PROJECT'
        axiosInstance.patch(`/quotation-item/${props.data.quotation_item.quotation_item_id}/`, data)
            .then(response => {
                const user_ids = user_list.map(user => user.id)
                dispatch({
                    type: 'CREATE_NOTIFICATION',
                    url_id: props.data.quotation_item.quotation.quotation_id,
                    targets: user_ids,
                    extra: 'Quotations/Items',
                    subject: 'Project',
                    action: `Item <ID : ${props.data.quotation_item.quotation_item_id}> has been updated`,
                    id: project_id
                })
                dispatch({
                    type: 'COMPONENTS',
                    loading: 'quotation',
                    data: response.data,
                    fetch: 'project_update',
                    message: 'Successfully updated a quotation item'
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


                data={quotation_item}

                response={error}

                onSubmit={(data) => { onSubmit(data) }}

            />
        </React.Fragment>
    )

}
