import React, { Component } from 'react'
import {
    LineChart, YAxis, XAxis, Tooltip, Legend, Line, CartesianGrid
} from 'recharts';
import moment from 'moment';
import axiosInstance from '../../api/axiosApi';
import { Empty, Button, Select, Row, Col } from 'antd';

const { Option } = Select;

class ProjectEstRev extends Component {

    state = {
        range: [],
        data: [],
    };

    componentDidMount() {
        this.getRange('month')
    }

    getData = (start, end) => {
        let metric = this.state.metric
        axiosInstance.get(`/project/est-rev/?metric=${metric}&start=${start}&end=${end}`)
            .then(response => {
                this.setState({ data: response.data });
            })
            .catch(error => {
                console.log(error);
            })
    }

    getRange = (metric) => {
        axiosInstance.get(`/date-range/?metric=${metric}&model=salesproject&field=creation_date`)
            .then(response => {
                this.setState({ metric: metric })
                this.setState({ range: response.data })
                let end = response.data[response.data.length - 1].end
                let firstDayOfEndMonth = response.data[response.data.length - 1].start
                if (metric === 'year') {
                    var start = (response.data.length > 3) ? moment(firstDayOfEndMonth).subtract(2, 'years').format("YYYY-MM-DD") : response.data[0].start
                }
                else if (metric === 'quarter') {
                    var start = (response.data.length > 3) ? moment(firstDayOfEndMonth).subtract(6, 'months').format("YYYY-MM-DD") : response.data[0].start
                }
                else if (metric === 'month') {
                    var start = (response.data.length > 3) ? moment(firstDayOfEndMonth).subtract(2, 'months').format("YYYY-MM-DD") : response.data[0].start;
                }
                this.setState({ selected: { start: start, end: end } }, () => this.getData(this.state.selected.start, this.state.selected.end))
            });
    }

    changeSelected = (position, value) => {
        this.setState({ selected: { ...this.state.selected, [position]: value } }, () => this.getData(this.state.selected.start, this.state.selected.end))
    }

    changeMetric = (value) => {
        this.getRange(value)
    }


    render() {
        const { range, data } = this.state;
        return (
            data.length ?
                <div style={{ width: 730 }}>
                    <p>Estimated Revenue</p>
                    {this.state.selected &&
                        <Row justify="start">
                            <Col span={8}>
                                Metric:
                                <Select value={this.state.metric} onChange={this.changeMetric} style={{ width: 180, marginLeft: '2%' }}>
                                    <Option value='month'>Month</Option>
                                    <Option value='quarter'>Quarter</Option>
                                    <Option value='year'>Year</Option>
                                </Select>
                            </Col>
                            <Col span={8}>
                                Start:
                                <Select value={this.state.selected.start} onChange={(value) => this.changeSelected('start', value)} style={{ width: 180, marginLeft: '2%' }}>
                                    {range.map(date => (
                                        <Option value={date.start}>{moment(date.start).format((this.state.metric === 'year') ? 'YYYY' : 'MMM YYYY')}</Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col span={8}>
                                End:
                                <Select value={this.state.selected.end} onChange={(value) => this.changeSelected('end', value)} style={{ width: 180, marginLeft: '2%' }}>
                                    {range.map(date => (
                                        <Option value={date.end}>{moment(date.start).format((this.state.metric === 'year') ? 'YYYY' : 'MMM YYYY')}</Option>
                                    ))}
                                </Select>
                            </Col>
                        </Row>
                    }
                    {data.map(rev => (
                        <LineChart width={730} height={250} data={rev.est_rev_data}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="formatted_date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey='est_rev_sum' stroke="#8884d8" />
                        </LineChart>
                    ))}
                </div>
                : null
        )
    }
}

export default ProjectEstRev;




