import React, { useState, useEffect } from 'react'
import { Steps, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import DynamicForm from '../../Application/DynamicForm';
import axiosInstance from '../../../api/axiosApi';
import CustomerDrawer from './CustomerDrawer';
const { Step } = Steps;

export default function QuotationCreateDrawer(props) {
    const dispatch = useDispatch()
    const user_list = useSelector(state => state.api.project.userProfile)
    const [block, setBlock] = useState([]);
    const [error, setError] = useState([]);
    const [inlineCreate, setInlineCreate] = useState(false);
    const [final, setFinal] = useState({})
    const [step, setStep] = useState(1);
    const [second, setSecond] = useState(false);

    useEffect(() => {
        if (Object.keys(final).length) {
            axiosInstance.get(`/budget-block/spotblock/?date=${final.due_date}`)
                .then(response => {
                    for (let i = 0; i < response.data.length; i++) {
                        response.data[i]['detail'] = `${response.data[i].item.item_code} (${response.data[i].vendor.vendor_name})`
                    }
                    setBlock(response.data);
                });
        }
    }, [inlineCreate])

    const onSubmitHeader = (data) => {
        setFinal(data);
        axiosInstance.get(`/budget-block/spotblock/?date=${data.due_date}`)
            .then(response => {
                for (let i = 0; i < response.data.length; i++) {
                    response.data[i]['detail'] = `${response.data[i].item.item_code} (${response.data[i].vendor.vendor_name})`
                }
                setBlock(response.data);
                setStep(2);
                setSecond(true);
            });
    }

    const onSubmit = (data) => {
        data = { ...data, ...final };
        let formData = new FormData();
        data['type'] = 'CUSTOMER'
        data['customer'] = props.id
        Object.keys(data).forEach((key, index) => {
            if (key === 'file') {
                if (data[key]) formData.append('file', data.file)
            }
            if (key === 'items') {
                formData.append('items', JSON.stringify(data.items))
            }
            else {
                if (data[key] !== null) formData.append(key, data[key]);
            }
        })
        axiosInstance.post('/quotation/', formData)
            .then(response => {
                dispatch({
                    type: 'COMPONENTS',
                    loading: 'quotation',
                    data: response.data,
                    fetch: 'customer_update',
                    message: 'Successfully created a quotation'
                })
                props.onClose()
            })
            .catch(error => {
                console.log(error)
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
            <Steps current={step}>
                <Step title="Select Budget Block" description="Select the budget block you wish to create this forecast in" />
                <Step title="Fill in Details" description="Fill in additional details about the forecast" />
            </Steps>
            {step === 1 ?
                <DynamicForm className="form"
                    model={[
                        { key: "document_date", label: "Document Date", type: "date" },
                        { key: "tax_date", label: "Tax Date", type: "date" },
                        { key: "due_date", label: "Due Date", type: "date" },
                        { key: "file", label: "Attach File", type: "file", blank: true },
                        { key: "remarks", label: "Remarks", type: "text_area", blank: true },
                    ]}

                    addon={[]}


                    data={second ? final : null}

                    response={error}

                    onSubmit={(data) => { onSubmitHeader(data) }}

                    submitButton='Next'

                />
                :
                <React.Fragment>
                    <Button onClick={() => setStep(1)}>Back</Button>
                    <DynamicForm className="form"

                        model={[]}

                        addon={[
                            {
                                model: 'items',
                                id: 'quotation_item_id',
                                name: 'Items',
                                add: blockAdd,
                                fields:
                                    [{ key: "quantity", label: "Quantity", type: 'number' },
                                    { key: "unit_price", label: "Unit Price", type: 'number' },
                                    { key: "moq", label: "MOQ", type: 'number' },
                                    { key: "mdq", label: "MDQ", type: 'number' },
                                    { key: "block", label: "Budget Block", type: "fkey", options: block, id: "block_id", name: "detail" },
                                    { key: "remarks", label: "Remarks", blank: true }]
                            }
                        ]}


                        data={null}

                        response={error}

                        onSubmit={(data) => { onSubmit(data) }}

                    />
                </React.Fragment>
            }
        </React.Fragment>

    )

}
