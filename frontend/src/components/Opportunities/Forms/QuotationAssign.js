import React, { useState, useEffect } from 'react'
import { Spin, Steps, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import DynamicForm from '../../Application/DynamicForm';
import QuotationItemList from '../QuotationItemList';
import axiosInstance from '../../../api/axiosApi';
import MUIDataTable from "mui-datatables";
const { Step } = Steps;

export default function QuotationAssign(props) {

    const dateFormat = require('dateformat');
    const dispatch = useDispatch()
    const user_list = useSelector(state => state.api.project.userProfile)
    const project_id = useSelector(state => state.api.project.sales_project_id)
    const [quotations, setQuotation] = useState([]);
    const [error, setError] = useState([]);
    const [data, setData] = useState([]);
    const [step, setStep] = useState(1);
    const [second, setSecond] = useState(false);

    const datatable = useSelector(state => state.mediaquery.datatable);

    const columns = [
        {
            name: "quotation_id",
            label: "ID",
            options: {
                filter: false,
                sort: false,
            }
        },
        {
            name: "quotation",
            label: "Quotation",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "details",
            label: "Details",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "date_time",
            label: "Date Time",
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value) => {
                    return dateFormat(value, "mmmm dS, yyyy, h:MM:ss TT")
                }
            }
        },
        {
            name: "decision",
            label: "Decision",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "customer.customer_name",
            label: "Customer",
            options: {
                filter: false,
                sort: false,
            }
        },
        {
            name: "quotation_id",
            label: "Items",
            options: {
                filter: false,
                sort: false,
                customBodyRender: (value) => {
                    return <QuotationItemList items={quotations.find(quotation => quotation.quotation_id === value).items} />
                }
            }
        },
    ];

    const options = {
        filterType: 'checkbox',
        selectableRowsHeader: false,
        selectableRows: "none",
        download: false,
        print: false,
        rowsPerPage: datatable ? 5 : 10,
        rowsPerPageOptions: datatable ? [5] : [10]
    }


    useEffect(() => {
        axiosInstance.get(`/quotation/unassignedquotation/?project=${project_id}`)
            .then(response => {
                setQuotation(response.data);
            });
    }, [])

    const onSubmit = (data) => {
        setData(data);
        setStep(2)
        setSecond(true)
    }

    const onSubmitFinal = () => {
        axiosInstance.patch(`/quotation/assignproject/?project=${project_id}`, data['quotation'])
            .then(response => {
                const user_ids = user_list.map(user => user.id)
                dispatch({
                    type: 'CREATE_NOTIFICATION',
                    url_id: data['quotation'],
                    targets: user_ids,
                    extra: 'Quotations(Multi)',
                    subject: 'Project',
                    action: 'assigned',
                    id: project_id
                })
                dispatch({
                    type: 'COMPONENTS',
                    loading: 'quotation',
                    data: response.data,
                    fetch: 'project_update',
                    message: 'Successfully assigned a quotation'
                })
                props.onClose()
            })
            .catch(error => {
                if (error.response) setError(error.response.data)
            })
    };

    return (
        <React.Fragment>
            <Steps current={step}>
                <Step title="Select Quotations" description="Select the quotations you wish to assign to this project" />
                <Step title="Confirmation" description="Check and confirm your selection(s)" />
            </Steps>
            {step === 1 ?
                <DynamicForm className="form"
                    model={[
                        { key: "quotation", label: "Quotation", type: "m2m", options: quotations, id: "quotation_id", name: "quotation_id" },
                    ]}

                    data={second ? data : null}

                    addon={[]}

                    response={error}

                    onSubmit={(data) => { onSubmit(data) }}

                    submitButton='Next'

                />
                :
                <React.Fragment>
                    <MUIDataTable
                        title={<Button onClick={() => setStep(1)}>Back</Button>}
                        data={quotations.filter(quotation => data['quotation'].includes(quotation.quotation_id))}
                        columns={columns}
                        options={options}
                    />
                    <Button onClick={() => onSubmitFinal()}>Submit</Button>
                </React.Fragment>
            }
        </React.Fragment>
    )

}
