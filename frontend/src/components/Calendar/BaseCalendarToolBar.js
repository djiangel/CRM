import React, { Component } from 'react';
import { Button, Space, Row, Col, Typography, Menu, Dropdown } from 'antd'
import {
    LeftOutlined,
    RightOutlined,
    DownOutlined
} from '@ant-design/icons';
import CalendarDrawer from './Form/CalendarDrawer';


const navigate = {
    PREVIOUS: 'PREV',
    NEXT: 'NEXT',
    TODAY: 'TODAY',
    DATE: 'DATE'
};
const { Title } = Typography

export class BaseCalendarToolBar extends Component {
    navigate = (action) => this.props.onNavigate(action);

    menu = () => (
        <Menu>
            {this.props.views.map(view => (
                <Menu.Item>
                    <Button
                        key={view}
                        type='text'
                        onClick={() => this.props.onView(view)}
                    >
                        {view}
                    </Button>
                </Menu.Item>))}
        </Menu>
    )

    render() {
        let {
            localizer: { messages },
        } = this.props;

        return (
            <div className='calendar-toolbar-grid'>
                <div className='calendar-toolbar-navigate-dates'>
                    <Button type="button" onClick={() => this.navigate(navigate.PREVIOUS)}>
                        <LeftOutlined />
                    </Button>
                    <Button onClick={() => this.navigate(navigate.TODAY)}>
                        Today
                        </Button>
                    <Button type="button" onClick={() => this.navigate(navigate.NEXT)}>
                        <RightOutlined />
                    </Button>
                </div>
                <div className='calendar-toolbar-date-title rbc-toolbar-label'>
                    {this.props.label}
                </div>
                <Dropdown overlay={this.menu}>
                    <Button className='calendar-toolbar-menu-more' ><DownOutlined /> More</Button>
                </Dropdown>
            </div>


        );
    }
}


export default BaseCalendarToolBar;