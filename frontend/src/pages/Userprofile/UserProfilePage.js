import React, { Component } from 'react'
import { connect } from "react-redux";
import { Card, Row, Col, Result, Button, Spin } from 'antd';
import AccountDetail from "../../containers/Userprofile/AccountDetail"
import AccountSettings from "../../containers/Userprofile/AccountSettings"
import MoonLoader from "react-spinners/MoonLoader";

class UserProfile extends Component {
  componentDidMount() {
    this.props.initial(this.props.match.params.id)
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.id !== nextProps.match.params.id) {
      this.props.initial(nextProps.match.params.id)
    }
  }
  render() {
    return (
      this.props.loading['userprofile'] == false ?
        !this.props.userprofile.error ?
          <Row gutter={24}>
            <Col lg={7} md={24}>
              <Card
                bordered={true}
                style={{
                  marginBottom: 24,
                }}
              >
                <AccountDetail
                  {...this.props} />
              </Card>
            </Col>
            <Col lg={17} md={24}>
              <Card
                bordered={true}
              >
                <AccountSettings
                  {...this.props} />
              </Card>
            </Col>
          </Row>
          :
          <Result
            status={this.props.userprofile.error.status}
            title={this.props.userprofile.error.status}
            subTitle={this.props.userprofile.error.message.detail}
            extra={<Button type="primary">Back Home</Button>}
          />
        :
        <div style={{ textAlign: "center", marginTop: '10%' }}>
          <Spin indicator={<MoonLoader
            size={100}
            color={"#1890ff"}
            loading={true}
          />}
            tip='Getting your profile information...' />
        </div>


    )
  }
}

const mapStateToProps = state => {
  return {
    userprofile: state.userprofile.userprofile,
    loading: state.loading.loading
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    initial: (id) => dispatch({ type: 'LOAD_USERPROFILE_DETAIL', id: id })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserProfile);

