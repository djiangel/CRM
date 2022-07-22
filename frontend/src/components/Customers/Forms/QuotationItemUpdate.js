import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import DynamicForm from '../../Application/DynamicForm';
import axiosInstance from '../../../api/axiosApi';
import CustomerDrawer from './CustomerDrawer';

export default function QuotationItemUpdate(props) {
    const dispatch = useDispatch()
    const [block, setBlock] = useState([]);
    const [error, setError] = useState([]);
    const [inlineCreate, setInlineCreate] = useState(false);

    useEffect(() => {
        axiosInstance.get(`/budget-block/spotblock/?date=${props.data.due_date}`)
            .then(response => {
                for (let i = 0; i < response.data.length; i++) {
                    response.data[i]['detail'] = `${response.data[i].item.item_code} (${response.data[i].vendor.vendor_name})`
                }
                setBlock(response.data);
            });
    }, [inlineCreate])


    const quotation_item = { ...props.data.quotation_item, 'block': props.data.quotation_item.block.block_id }

    const onSubmit = (data) => {
        data['type'] = 'CUSTOMER'
        axiosInstance.patch(`/quotation-item/${props.data.quotation_item.quotation_item_id}/`, data)
            .then(response => {
                dispatch({
                    type: 'COMPONENTS',
                    loading: 'quotation',
                    data: response.data,
                    fetch: 'customer_update',
                    message: `Successfully updated quotation item ${props.data.quotation_item.quotation_item_id}`
                })
                props.onClose()
            })
            .catch(error => {
                if (error.response) setError(error.response.data)
            })
    };

    const blockAdd = <CustomerDrawer
        inlineCreate={() => setInlineCreate(!inlineCreate)}
        button_name='Create Budget Block'
        title='Create Budget Block'
        component='BudgetBlockCreate'
        button_type='create'
        button_style='primary' />


    return (
        <React.Fragment>
            <DynamicForm className="form"
                model={[
                    { key: "quantity", label: "Quantity", type: 'number' },
                    { key: "unit_price", label: "Unit Price", type: 'number' },
                    { key: "moq", label: "MOQ", type: 'number' },
                    { key: "mdq", label: "MDQ", type: 'number' },
                    { key: "block", label: "Budget Block", type: "fkey", options: block, id: "block_id", name: "detail", add: blockAdd },
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
