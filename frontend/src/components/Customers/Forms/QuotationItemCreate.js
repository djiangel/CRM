import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import DynamicForm from '../../Application/DynamicForm';
import axiosInstance from '../../../api/axiosApi';
import CustomerDrawer from './CustomerDrawer';

export default function QuotationItemCreate(props) {
    const dispatch = useDispatch()
    const [block, setBlock] = useState([]);
    const [error, setError] = useState([]);
    const customer_id = useSelector(state => state.api.customer.customer_id)
    const [inlineCreate, setInlineCreate] = useState(false);

    useEffect(() => {
        axiosInstance.get(`/budget-block/spotblock/?date=${props.quotation.due_date}`)
            .then(response => {
                for (let i = 0; i < response.data.length; i++) {
                    response.data[i]['detail'] = `${response.data[i].item.item_code} (${response.data[i].vendor.vendor_name})`
                }
                setBlock(response.data);
            });
    }, [inlineCreate])

    const onSubmit = (data) => {
        data['quotation'] = props.quotation.quotation_id
        data['customer'] = customer_id
        data['type'] = 'CUSTOMER'
        axiosInstance.post('/quotation-item/', data)
            .then(response => {
                dispatch({
                    type: 'COMPONENTS',
                    loading: 'quotation',
                    data: response.data,
                    fetch: 'customer_update',
                    message: 'Successfully created a quotation item'
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


                data={null}

                response={error}

                onSubmit={(data) => { onSubmit(data) }}

            />
        </React.Fragment>
    )

}
