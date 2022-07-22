import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axiosInstance from '../../../api/axiosApi';
import DynamicForm from '../../Application/DynamicForm';
import { Steps, Button } from 'antd';
const { Step } = Steps;

export default function ForecastCreate(props) {
    const project_id = useSelector(state => state.api.project.sales_project_id)

    const user_list = useSelector(state => state.api.project.userProfile)

    const [blocks, setBlocks] = useState([]);
    const [currency, setCurrency] = useState([]);
    const [error, setError] = useState([]);
    const [step, setStep] = useState(1);
    const [block, setBlock] = useState([]);
    const [block_id, setBlock_id] = useState(null);
    const dispatch = useDispatch()

    useEffect(() => {
        axiosInstance.get('/sales-project/getcurrencies/')
            .then(response => {
                setCurrency(response.data);
            });
        axiosInstance.get(`/budget-block/projectblock/?project=${project_id}`)
            .then(response => {
                let data = response.data;
                for (let i = 0; i < data.length; i++) {
                    data[i]['detail'] = `${data[i]['start_date']} - ${data[i]['end_date']} / ${data[i].item.item_code} / ${data[i].vendor.vendor_name}`
                }
                setBlocks(data);
            });
    }, [])

    const onSubmitBlock = (data) => {
        setBlock(blocks.find(block => block.block_id === data.block))
        setBlock_id(data.block)
        setStep(2)
    }

    const onSubmit = (data) => {
        data['project'] = project_id;
        data['block'] = block_id
        axiosInstance.post('/revenue-forecast/', data)
            .then(response => {
                props.onClose()
                const user_ids = user_list.map(user => user.id)
                dispatch({
                    type: 'CREATE_NOTIFICATION',
                    id: response.data.forecast_id,
                    targets: user_ids,
                    extra: 'Forecast',
                    subject: 'Project',
                    action: 'created',
                    url_id: project_id,
                })
                dispatch({
                    type: 'COMPONENTS',
                    loading: 'forecast',
                    data: response.data.project,
                    fetch: 'project_update',
                    message: 'Successfully added a revenue forecast'
                })
            })
            .catch(error => {
                if (error.response) setError(error.response.data)
            })
    };

    return (
        <React.Fragment>
            <Steps current={step}>
                <Step title="Select Budget Block" description="Select the budget block you wish to create this forecast in" />
                <Step title="Create Revenue Forecast" description="Fill in additional details about the forecast" />
            </Steps>
            {step === 1 ?
                <DynamicForm className="form"
                    model={[
                        { key: "block", label: "Budget Block", type: "fkey", options: blocks, id: "block_id", name: "detail" },
                    ]}

                    data={null}

                    addon={[]}

                    response={error}

                    onSubmit={(data) => { onSubmitBlock(data) }}

                    submitButton='Next'

                />
                :
                <React.Fragment>
                    <DynamicForm className="form"
                        model={[
                            { key: "quantity", label: "Quantity" },
                            { key: "month", label: "Month", type: "month" },
                            { key: "buy_price", currency_key: 'buy_price_currency', label: "Buy Price", type: "money", options: currency },
                            { key: "sell_price", currency_key: 'sell_price_currency', label: "Sell Price", type: "money", options: currency },
                        ]}

                        data={block}

                        addon={[]}

                        response={error}

                        onSubmit={(data) => { onSubmit(data) }}

                    />
                </React.Fragment>
            }

        </React.Fragment>
    )
}
