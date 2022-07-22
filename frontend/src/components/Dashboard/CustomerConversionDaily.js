import React, { useRef, useEffect, useState } from "react";
import axiosInstance from '../../api/axiosApi';
import { Empty, Spin, Card } from 'antd';
import { useDispatch, useSelector } from 'react-redux'
import { Bar } from 'react-chartjs-2';

function CustomerConversionTest() {

    const data = useSelector(state => state.api.analytics.client)

    const [final, setFinal] = useState(null);

    useEffect(() => {
        setFinal({
            labels: data.map(d => d.conversion_date),
            datasets: [
                {
                    label: 'My First dataset',
                    backgroundColor: 'rgba(255,99,132,0.2)',
                    borderColor: 'rgba(255,99,132,1)',
                    borderWidth: 1,
                    hoverBackgroundColor: 'rgba(255,99,132,0.4)',
                    hoverBorderColor: 'rgba(255,99,132,1)',
                    data: data.map(d => d.count)
                }
            ]
        })
    }, [])

    return (
        <React.Fragment>
            Clients Converted Daily
            {final ?
                <div className='customer-converted-daily-bar'>
                    <Bar
                        data={final}
                        options={{
                            maintainAspectRatio: false,
                            responsive: true
                        }}
                    />
                </div>
                : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ height: '100%' }} />}
        </React.Fragment>
    )
}

export default CustomerConversionTest


/*

<ResponsiveContainer width="99%" height={250}>
                    <BarChart width={730} height={250} data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="conversion_date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>

                */
