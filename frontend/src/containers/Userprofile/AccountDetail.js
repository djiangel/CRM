import React, { Component, Fragment } from 'react'
import { connect } from "react-redux";
import { Typography, Row, Col, Avatar, Spin, Button, Space } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, CalendarOutlined } from '@ant-design/icons';


const baseURL = process.env.REACT_APP_BACK_URL

const { Title } = Typography;
const { Text } = Typography;
class AccountDetail extends Component {

    convertLocalTime(data) {
        const dateFormat = require('dateformat');
        var date = new Date(data)
        var newdate = dateFormat(date, "mmmm dS, yyyy, h:MM:ss TT")
        return newdate
    }
    render() {
        console.log(this.props.userprofile.error)
        console.log(this.props.userprofile.profile_picture)
        return (
            <Fragment>
                <Row>
                    <Col span={24} align="middle" justify="center" style={{ paddingBottom: 20 }}>
                        {this.props.userprofile.profile_picture ?
                            <Avatar src={this.props.userprofile.profile_picture[0] === '/' ? baseURL + this.props.userprofile.profile_picture : this.props.userprofile.profile_picture} size={100} />
                            : <Avatar icon={<UserOutlined />} size={100} />}
                    </Col>
                    <Col span={24} align="middle" justify="center">
                        <Title level={4}>{this.props.userprofile.user.username}</Title>
                    </Col>
                </Row>
                <Row style={{ padding: 10 }}>
                    <Space direction="vertical">
                        <Col span={24}>
                            <Text><MailOutlined /> Email : {this.props.userprofile.email}</Text>
                        </Col>
                        <Col span={24}>
                            <Text><PhoneOutlined /> Phone : {this.props.userprofile.contact_number}</Text>
                        </Col>
                        <Col span={24}>
                            <Text><CalendarOutlined /> Date joined: {this.convertLocalTime(this.props.userprofile.user.date_joined)}</Text>
                        </Col>
                        <Col span={24}>
                            <Text> Role: {this.props.userprofile.user.groups.map(
                                (group) => {
                                    return (
                                        <Button shape="round" key={group.id}>{group.name}</Button>
                                    )
                                })}
                            </Text>
                        </Col>
                    </Space>
                </Row>
            </Fragment>
        )
    }
}
const mapStateToProps = state => {
    return {
        userprofile: state.userprofile.userprofile,
        loading: state.loading.loading
    };
};




export default connect(mapStateToProps, null)(AccountDetail);

