import React, { useState, useEffect } from 'react'
import { Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import DynamicForm from '../../Application/DynamicForm';
import axiosInstance from '../../../api/axiosApi';
import ItemDrawer from '../../Items/Forms/ItemDrawer';

export default function QuotationItemCreate(props) {
    const dispatch = useDispatch()
    const [item, setItem] = useState([]);
    const [error, setError] = useState([]);
    const [inlineCreate, setInlineCreate] = useState(false);
    const [block, setBlock] = useState([]);
    const due_date = useSelector(state => state.api.quotation.due_date)

    useEffect(() => {
        if (props.type === 'CUSTOMER') {
            axiosInstance.get(`/budget-block/spotblock/?date=${due_date}`)
                .then(response => {
                    for (let i = 0; i < response.data.length; i++) {
                        response.data[i]['detail'] = `${response.data[i].item.item_code} (${response.data[i].vendor.vendor_name})`
                    }
                    setBlock(response.data);
                });
        }
        else if (props.type === 'PROJECT') {
            axiosInstance.get(`/budget-block/projectblock/?project=${props.project_id}&date=${due_date}`)
                .then(response => {
                    for (let i = 0; i < response.data.length; i++) {
                        response.data[i]['detail'] = `${response.data[i].item.item_code} (${response.data[i].vendor.vendor_name})`
                    }
                    setBlock(response.data);
                });
        }
    }, [inlineCreate])

    const onSubmit = (data) => {
        data['quotation'] = props.id
        data['type'] = 'QUOTATION'
        axiosInstance.post('/quotation-item/', data)
            .then(response => {
                console.log(response)
                if (response.data.salesProject) {
                    const user_ids = response.data.salesProject.userProfile
                    dispatch({
                        type: 'CREATE_NOTIFICATION',
                        url_id: response.data.quotation_id,
                        targets: user_ids,
                        extra: 'Quotations',
                        subject: 'Project',
                        action: 'updated with more item(s)',
                        id: response.data.salesProject.sales_project_id
                    })
                }
                dispatch({
                    type: 'QUOTATION_UPDATE',
                    data: response.data,
                    message: `Successfully created a quotation item`
                })
                props.onClose()
            })
            .catch(error => {
                if (error.response) setError(error.response.data)
            })
    };

    const itemAdd = <ItemDrawer data={item}
        inlineCreate={() => setInlineCreate(!inlineCreate)}
        button_name='Create Item'
        title='Create Item'
        component='ItemCreate' />



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
