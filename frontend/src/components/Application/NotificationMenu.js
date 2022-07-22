
import { Skeleton, Typography } from 'antd';
import {
  BellFilled,
} from '@ant-design/icons';
import React, { Component, Fragment } from 'react'
import WebSocketInstance from '../../api/websocket'
import { connect } from 'react-redux';
import 'ant-design-pro/dist/ant-design-pro.css'
import NoticeIcon from 'ant-design-pro/lib/NoticeIcon';
import { Tag } from 'antd';
import { withRouter } from 'react-router-dom';
const { Text } = Typography

export class NotificationMenu extends Component {

  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      page: 0,
    }
    this.onItemClick = this.onItemClick.bind(this);
    this.onClear = this.onClear.bind(this);
    this.onViewMore = this.onViewMore.bind(this);
  }
  onItemClick(item) {
    if (item.read === false) {
      this.props.readnotifications(item.id)
    }
    this.props.history.push(item.object_url)
  }

  onClear(tabTitle) {
    this.props.readAllnotifications()
  }
  onViewMore(tabProps, event) {
    this.setState(prevState => {
      return { page: prevState.page + 1 }
    },
      () => { this.props.loadnextnotifications(this.state.page) })
  }

  handleVisibleChange = flag => {
    this.setState({ visible: flag });
  };

  componentDidMount() {
    this.props.loadnotifications()
    WebSocketInstance.connect()
  }

  prepareNotifications() {
    const dateFormat = require('dateformat');
    return this.props.notifications.notifications.map(d => {
      var date = new Date(d['datetime'])
      var newdate = dateFormat(date, "mmmm dS, yyyy, h:MM:ss TT")
      const color = {
        'Sales Project': 'gold',
        'Ticket': 'blue',
        'Customer': 'red',
        'Vendor': '',
      }[d['extra']]
      return {
        ...d,
        datetime: newdate,
        extra: (
          <Tag color={color} style={{ marginRight: 0 }}>
            {d['extra']}
          </Tag>
        )
      }
    })
  }

  render() {
    return (
      <NoticeIcon className="notice-icon" loading={this.props.loading['notifications']} bell={<BellFilled style={{ fontSize: '22px' }} />} onViewMore={this.onViewMore} count={this.props.notifications.counter} onItemClick={this.onItemClick} onClear={this.onClear}>
        <NoticeIcon.Tab
          list={this.prepareNotifications()}
          title="notification"
          emptyText="Hey! You have no notifications so far"
          emptyImage="https://gw.alipayobjects.com/zos/rmsportal/wAhyIChODzsoKIOBHcBk.svg"
          showViewMore={true}
        />
      </NoticeIcon>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    loadnotifications: () => dispatch({ type: 'LOAD_NOTIFICATION' }),
    loadnextnotifications: (page) => dispatch({ type: 'LOAD_NEXT_NOTIFICATION', page: page }),
    readnotifications: (notification) => dispatch({ type: 'READ_NOTIFICATION', notification_id: notification }),
    readAllnotifications: () => dispatch({ type: 'READ_ALL_NOTIFICATIONS' }),
  }
}


const mapStateToProps = (state) => ({
  loading: state.loading.loading,
  notifications: state.notifications
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NotificationMenu));
