import React, { useState, useEffect } from 'react'
import { Drawer, Button, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import DynamicForm from '../../Application/DynamicForm';
import axiosInstance from '../../../api/axiosApi';

export default function BudgetBlockUpdateDrawer(props) {

    const dispatch = useDispatch()
    const [error, setError] = useState([]);
    const [currency, setCurrency] = useState([]);

    const budget_block = { ...props.budget_block, 'item': props.budget_block.item.item_id }
    const user_list = useSelector(state => state.api.project.userProfile)
    const project_id = useSelector(state => state.api.project.sales_project_id)

    const id = budget_block.block_id

    useEffect(() => {
        axiosInstance.get('/sales-project/getcurrencies/')
            .then(response => {
                setCurrency(response.data);
            });
    }, [])

    const onSubmit = (data) => {
        data['type'] = 'PROJECT'
        axiosInstance.patch(`/budget-block/${id}/`, data)
            .then(response => {
                const user_ids = user_list.map(user => user.id)
                dispatch({
                    type: 'UPDATE_NOTIFICATION',
                    id: id,
                    url_id: project_id,
                    original: budget_block,
                    final: data,
                    extra: 'Project Item',
                    targets: user_ids,
                    subject: `Project ID ${project_id} / `
                })

                dispatch({
                    type: 'COMPONENTS',
                    loading: 'block',
                    data: response.data,
                    fetch: 'project_update',
                    message: `Successfully updated budget block ${id}`
                })
                props.onClose()
            })
            .catch(error => {
                if (error.response) setError(error.response.data)
            })
    }

    return (
        <React.Fragment>
            <DynamicForm className="form"

                model={[
                    { start_key: "start_date", end_key: "end_date", label: "Date Range", type: "month_range" },
                    { key: "buy_price", currency_key: 'buy_price_currency', label: "Buy Price", type: "money", options: currency },
                    { key: "sell_price", currency_key: 'sell_price_currency', label: "Sell Price", type: "money", options: currency },
                ]}

                addon={[]}

                data={budget_block}

                response={error}

                onSubmit={(data) => { onSubmit(data) }}
            />
        </React.Fragment >
    )
}