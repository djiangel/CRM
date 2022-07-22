import React, { useState, useEffect } from 'react'
import moment from 'moment';
import axiosInstance from '../../api/axiosApi';
import { Empty, Button, Select, Row, Col, Spin, Modal } from 'antd';
import { FullscreenOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import { Pie } from 'react-chartjs-2';

const { Option } = Select;

export default function CustomerSource({ group }) {

  const [visible, setVisible] = useState(false);
  const [final, setFinal] = useState(null);

  const data = useSelector(state => state.api.analytics.source)
  const loading = useSelector(state => state.loading.loading)

  const dispatch = useDispatch()

  useEffect(() => {
    if (data.data) {

      let background = []; let border = []; let hover = [];

      for (let i = 0; i < data.data.sources.length; i++) {
        let r = Math.floor(Math.random() * 255);
        let g = Math.floor(Math.random() * 255);
        let b = Math.floor(Math.random() * 255);
        background.push(`rgba(${r}, ${g}, ${b}, 0.2)`);
        border.push(`rgba(${r}, ${g}, ${b}, 1)`);
        hover.push(`rgba(${r}, ${g}, ${b}, 0.4)`);
      }

      setFinal({
        labels: data.data.sources,
        datasets: [
          {
            label: 'Client Count',
            backgroundColor: background,
            borderColor: border,
            borderWidth: 1,
            hoverBackgroundColor: hover,
            hoverBorderColor: border,
            data: data.data.count
          }
        ]
      })
    }
  }, [data])


  const chart = (modal) => {

    return (
      data.data ?
        <React.Fragment>
          <div className='select-grid'>
            <div className='select-metric-title'>Metric:</div>
            <div className='metric-select'>
              <Select value={data.metric} onChange={(value) => dispatch({ type: 'RANGE_ANALYTICS', loading: 'source', group: group, metric: value, range: true })}>
                <Option value='month'>Month</Option>
                <Option value='quarter'>Quarter</Option>
                <Option value='year'>Year</Option>
              </Select>
            </div>
            <div className='select-start-title'>Start:</div>
            <div className='start-select'>
              <Select value={data.start} onChange={(value) => dispatch({ type: 'RANGE_ANALYTICS', loading: 'source', group: group, start: value })}>
                {data.range.map(date => (
                  <Option value={date.start}>{date.formatted_date}</Option>
                ))}
              </Select>
            </div>
            <div className='select-end-title'>End:</div>
            <div className='end-select'>
              <Select value={data.end} onChange={(value) => dispatch({ type: 'RANGE_ANALYTICS', loading: 'source', group: group, end: value })}>
                {data.range.map(date => (
                  <Option value={date.end}>{date.formatted_date}</Option>
                ))}
              </Select>
            </div>
          </div>
          <div className="customer-source-pie">
            <Pie data={final} />
          </div>
        </React.Fragment>
        : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ height: '100%' }} />
    )
  }


  return (
    <React.Fragment>
      <p>Customer Source
      <Button type="primary" style={{ float: 'right' }} size='small' shape='circle' onClick={() => setVisible(true)}>
          <FullscreenOutlined />
        </Button>
      </p>
      {loading['source'] === false ? chart() : <div style={{ textAlign: 'center' }}><Spin /></div>}
      <Modal
        title="Actual Revenue VS KPI"
        width={'85vw'}
        bodyStyle={{ height: '80vh', display: 'flex', flexFlow: 'column' }}
        style={{ top: '1%' }}
        visible={visible}
        onOk={() => setVisible(false)}
        onCancel={() => setVisible(false)}
      >
        {loading['source'] === false && visible ? chart(true) : <div style={{ textAlign: 'center' }}><Spin /></div>}
      </Modal>
    </React.Fragment>
  )
}



/*


    const minProp = 0
    const maxProp = this.props.data.data ? max(this.props.data.data.count, d => d.count) : null
    const exampleColorScale = scaleLinear()
      .domain([minProp, maxProp])
      .range(['cyan', 'orange']);

    let width = this.props.data.data ? modal ? `${this.props.data.data.dates.length * 15}%` : `${this.props.data.data.dates.length * 20}%` : null
    let height = this.props.data.data ? modal ? `${this.props.data.data.sources.length * 20}%` : `${this.props.data.data.sources.length * 30}%` : null

    console.log(height)

          <FlexibleXYPlot
            xType="ordinal"
            xDomain={this.props.data.data.dates.map(date => `${date.start}`)}
            yType="ordinal"
            yDomain={this.props.data.data.sources.map(source => source)}
            margin={{ left: 100, right: 10, top: 40, bottom: 40 }}
          >
            <XAxis orientation="top" />
            <YAxis width={100} />
            <HeatmapSeries
              colorType="literal"
              getColor={d => exampleColorScale(d.count)}
              style={{
                stroke: 'gray',
                strokeWidth: '1px',
                rectStyle: {
                  rx: 10,
                  ry: 10,
                  width: 100,
                  height: 200
                }
              }}
              className="heatmap-series-example"
              data={this.props.data.data.count}
            />
            <LabelSeries
              style={{ pointerEvents: 'none' }}
              data={this.props.data.data.count}
              labelAnchorX="middle"
              labelAnchorY="baseline"
              getLabel={d => `${d.count}`}
            />
          </FlexibleXYPlot>

          */
