
import React, { Component, Fragment } from 'react'
import { connect } from "react-redux";
import { Tabs } from 'antd';
import NotificationSettings from './../../components/userprofile/NotificationSettings'
import EmailSettings from './../../components/userprofile/EmailSettings'
import GeneralSettings from './../../components/userprofile/GeneralSettings'
import PasswordSettings from '../../components/userprofile/PasswordSettings'

const { TabPane } = Tabs;
class AccountSettings extends Component {

    render() {
        return (
                <Tabs defaultActiveKey="1"  tabPosition="left">
                    <TabPane tab="Notifications Settings" key="1">
                        <NotificationSettings/>
                    </TabPane>
                    <TabPane tab="General Settings" key="2">
                        <GeneralSettings/>
                    </TabPane>
                    <TabPane tab="Security Settings" key="3">
                        <Fragment>
                        <PasswordSettings/>
                        <EmailSettings/>
                        </Fragment>
                    </TabPane>
                </Tabs>
        )
    }
}


export default connect(null, null)(AccountSettings);