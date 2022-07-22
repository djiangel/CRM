import React, { useState, useEffect } from 'react'
import { Drawer, Button, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ItemDrawer from '../../Items/Forms/ItemDrawer';
import { useDispatch, useSelector } from 'react-redux'
import DynamicForm from '../../Application/DynamicForm';
import axiosInstance from '../../../api/axiosApi';
import VendorDrawer from '../../Vendors/Forms/VendorDrawer';

export default function BudgetBlockCreate(props) {

    const dispatch = useDispatch()
    const project_id = useSelector(state => state.api.project.sales_project_id)
    const [item, setItem] = useState([]);
    const [currency, setCurrency] = useState([]);
    const [vendor, setVendor] = useState([]);
    const [error, setError] = useState([]);
    const [inlineCreate, setInlineCreate] = useState(false);
    const user_list = useSelector(state => state.api.project.userProfile)

    useEffect(() => {
        axiosInstance.get('/sales-project/getcurrencies/')
            .then(response => {
                setCurrency(response.data);
            });
    }, [])

    useEffect(() => {
        axiosInstance.get(`/item/`)
            .then(response => {
                setItem(response.data.items);
            });
        axiosInstance.get('/vendor-information/')
            .then(response => {
                setVendor(response.data);
            });
    }, [inlineCreate])

    const onSubmit = (data) => {
        data['type'] = 'CUSTOMER'
        axiosInstance.post(`/budget-block/`, data)
            .then(response => {
                if (props.inlineCreate) {
                    props.inlineCreate()
                }
                props.onClose()
            })
            .catch(error => {
                if (error.response) setError(error.response.data)
            })
    }

    const itemAdd = <ItemDrawer data={item}
        inlineCreate={() => setInlineCreate(!inlineCreate)}
        button_name='Create Item'
        title='Create Item'
        component='ItemCreate'
        button_style='primary'
        button_shape='circle'
        button_type='create_only' />

    const vendorAdd = <VendorDrawer
        inlineCreate={() => setInlineCreate(!inlineCreate)}
        button_name='Create Vendor'
        title='Create Vendor'
        component='VendorCreate'
        button_style='primary'
        button_shape='circle'
        button_type='create_only' />

    return (
        <React.Fragment>
            <DynamicForm className="form"

                model={[
                    { start_key: "start_date", end_key: "end_date", label: "Date Range", type: "month_range" },
                    { key: "item", label: "Item", type: "fkey", options: item, id: "item_id", name: "item_code", add: itemAdd },
                    { key: "vendor", label: "Vendor", type: "fkey", options: vendor, id: "vendor_id", name: "vendor_name", add: vendorAdd },
                    { key: "buy_price", currency_key: 'buy_price_currency', label: "Buy Price", type: "money", options: currency },
                    { key: "sell_price", currency_key: 'sell_price_currency', label: "Sell Price", type: "money", options: currency },
                ]}

                addon={[]}

                data={null}

                response={error}

                onSubmit={(data) => { onSubmit(data) }}
            />
        </React.Fragment >
    )
}