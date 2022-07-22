import React, { useState, Fragment, useEffect } from 'react'
import { Calendar, momentLocalizer, Views } from 'react-big-calendar'
import moment from 'moment'
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Tag, Card, Drawer, Typography, Row, Col, Space, Button } from 'antd';
import BaseCalendarToolBar from './BaseCalendarToolBar';
import './calendar.css'
import { useSelector } from 'react-redux'

// Format for passing data to base calendar is 
// {{'type':'project',
//   'value':{'id':1}
// }}

const { Text } = Typography;

let allViews = Object.keys(Views).map(k => Views[k])

export default function BaseCalendar(props) {
  const now = new Date()
  const [visible, setVisible] = useState(false);
  const [selected_task, setTask] = useState();

  const showDrawer = (event) => {
    setTask(event)
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  // top + height no overlap

  const localizer = momentLocalizer(moment)
  const reactStringReplace = require('react-string-replace');

  const navigate = {
    PREVIOUS: 'PREV',
    NEXT: 'NEXT',
    TODAY: 'TODAY',
    DATE: 'DATE'
  };

  const customEventPropGetter = event => {
    if (event.priority === 'low') {
      return {
        className: 'low-priority',
        style: {
          background: 'rgba(41, 163, 41, 0.2)',
          color: '#000000',
          borderColor: 'rgba(41, 163, 41, 1)'
        },
      }
    }
    if (event.priority === 'medium') {
      return {
        className: 'medium-priority',
        style: {
          background: 'rgba(75, 192, 192, 0.2)',
          color: '#000000',
          borderColor: 'rgba(75, 192, 192, 1)'
        },
      }
    }
    if (event.priority === 'urgent') {
      return {
        className: 'high-priority',
        style: {
          background: 'rgba(255, 51, 51, 0.2)',
          color: '#000000',
          borderColor: 'rgba(255, 51, 51, 1)'
        },
      }
    }
  }

  const mediaquery = useSelector(state => state.mediaquery.size);

  return (
    <Fragment>
      <Calendar
        events={props.tasks}
        components={{
          toolbar: BaseCalendarToolBar
        }}
        tooltipAccessor={'content'}
        allDayAccessor={'all_day'}
        views={allViews}
        step={60}
        eventPropGetter={customEventPropGetter}
        localizer={localizer}
        onSelectEvent={event => showDrawer(event)}
        className='crm-calendar'
        // onView={(view) => hideExtraEvents(view)}
        dayLayoutAlgorithm={'no-overlap'}
      />

      {selected_task ?
        <Drawer
          title="Task Detail"
          placement="right"
          closable={false}
          onClose={onClose}
          visible={visible}
          width={mediaquery === 'xs' ? '100%' : 720}
        >
          <Row>
            <Space direction="vertical">
              <Col span={24}>
                <Text>Priority : {selected_task.priority}</Text>
              </Col>
              <Col span={24}>
                <Text>Title : {selected_task.title}</Text>
              </Col>
              <Col span={24}>
                <Text>Content :
                {reactStringReplace(selected_task.content, /@\[(.*?)]/g, (match, i) => (
                  <Tag color="geekblue" key={i}>{match}</Tag>
                ))}
                </Text>
              </Col>
              <Col span={24}>
                <Text>Title : {selected_task.title}</Text>
              </Col>
            </Space>
          </Row>
          <Row>
            <Col span={12}>
              <Text>Start : {selected_task.start.toString()}</Text>
            </Col>
            <Col span={12}>
              <Text>End : {selected_task.end.toString()}</Text>
            </Col>
          </Row>
        </Drawer>
        : null}
    </Fragment>
  )
}
