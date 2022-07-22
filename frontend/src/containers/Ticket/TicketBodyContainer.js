import React, { Component, Fragment } from 'react'
import { Row, Tabs, Col, Card } from 'antd';
import { connect } from "react-redux";
import { AppleOutlined, AndroidOutlined } from '@ant-design/icons';
import './Ticket.css'

const { TabPane } = Tabs;

class TicketBodyContainer extends Component {

    render() {
        return (
            <Card className="hoveritem">
                <Tabs defaultActiveKey="2">
                    <TabPane
                        tab={
                            <span>
                                <AppleOutlined />
                        Conversations
                        </span>
                        }
                        key="1"
                    >
                        Tab 1
                    </TabPane>
                    <TabPane
                        tab={
                            <span>
                                <AndroidOutlined />
                        History
                        </span>
                        }
                        key="2"
                    >
                        Tab 2
                    </TabPane>
                </Tabs>
            </Card>
        )
    }
}



const mapStateToProps = state => {
    return {
        ticket: state.ticket.selected_ticket
    };
};


export default connect(mapStateToProps, null)(TicketBodyContainer);

