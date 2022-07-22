import React, { useState, useEffect } from 'react'
import { Button, Steps } from 'antd';
import { useDispatch, useSelector } from 'react-redux'
import DynamicForm from '../../Application/DynamicForm';
import axiosInstance from '../../../api/axiosApi';
import { useHistory } from 'react-router-dom';
const { Step } = Steps;

export default function QuotationCreateProject(props) {
    const dispatch = useDispatch()
    const history = useHistory()
    const [block, setBlock] = useState([]);
    const [projects, setProject] = useState([]);
    const [error, setError] = useState([]);
    const [final, setFinal] = useState([])
    const [step, setStep] = useState(1);
    const [second, setSecond] = useState(false);

    useEffect(() => {
        axiosInstance.get('/sales-project/')
            .then(response => {
                setProject(response.data);
            });
    }, [])

    const onSubmitHeader = (data) => {
        setFinal(data);
        axiosInstance.get(`/budget-block/projectblock/?project=${data.salesProject}&date=${data.due_date}`)
            .then(response => {
                for (let i = 0; i < response.data.length; i++) {
                    response.data[i]['detail'] = `${response.data[i].item.item_code} (${response.data[i].vendor.vendor_name})`
                }
                setBlock(response.data);
                setStep(2);
                setSecond(true);
            });
    }

    const onSubmitFinal = (data) => {
        data = { ...data, ...final };
        let formData = new FormData();
        data['customer'] = projects.find(project => project.sales_project_id === final.salesProject).customerInformation.customer_id
        data['type'] = 'QUOTATION'
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
                props.onClose()
                history.push(`/quotation/detail/${response.data.quotation.quotation_id}`);
                console.log(response.data)
                dispatch({
                    type: 'CREATE_NOTIFICATION',
                    id: response.data.quotation.salesProject.sales_project_id,
                    targets: response.data.user_list,
                    extra: 'Quotations',
                    subject: 'Project',
                    action: 'created',
                    url_id: response.data.quotation.quotation_id
                })
            })
            .catch(error => {
                if (error.response) setError(error.response.data)
            })
    };

    return (
        <React.Fragment>
            <Steps current={step}>
                <Step title="Create Quotation" description="Fill in quotation details" />
                <Step title="Add Quotation Items" description="Fill in as many quotation items as you want" />
            </Steps>
            {step === 1 ?
                <DynamicForm className="form"
                    model={[
                        { key: "salesProject", label: "Project", type: "fkey", options: projects, id: "sales_project_id", name: "sales_project_name" },
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

                /> :
                <React.Fragment>
                    <Button onClick={() => setStep(1)}>Back</Button>
                    <DynamicForm className="form"

                        model={[]}

                        addon={[
                            {
                                model: 'items',
                                id: 'quotation_item_id',
                                name: 'Items',
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

                        onSubmit={(data) => { onSubmitFinal(data) }}

                    />
                </React.Fragment>
            }
        </React.Fragment>

    )
}
