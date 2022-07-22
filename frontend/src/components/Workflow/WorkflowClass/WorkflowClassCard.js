import React, { Component } from 'react'
import { Card, Col } from 'antd';
import {
  DollarOutlined,
  TeamOutlined,
  KeyOutlined,
  LikeOutlined
} from '@ant-design/icons';
import ConfirmationNumberIcon from '@material-ui/icons/ConfirmationNumber';
import { Link } from 'react-router-dom';


export class WorkflowClassCard extends Component {
  render() {
    return (
      <Col span={12}>
        <Link to={`/workflows/view/${this.props.id}`}>
          <Card align="center" className="hoveritem" title={this.props.content_type.model}>
            {this.props.content_type.model === "salesproject" &&
              <DollarOutlined style={{ fontSize: '94px', paddingBottom: '60px', paddingTop: '40px' }} />
            }
            {this.props.content_type.model === "customerinformation" &&
              <TeamOutlined style={{ fontSize: '94px', color: '#52c41a', paddingBottom: '60px', paddingTop: '40px' }} />
            }
            {this.props.content_type.model === "vendorinformation" &&
              <TeamOutlined style={{ fontSize: '94px', color: '#eb2f96', paddingBottom: '60px', paddingTop: '40px' }} />
            }
            {this.props.content_type.model === "quotation" &&
              <KeyOutlined style={{ fontSize: '94px', paddingBottom: '60px', paddingTop: '40px' }} />
            }
            {this.props.content_type.model === "budgetblock" &&
              <LikeOutlined style={{ fontSize: '94px', color: '#52c41a', paddingBottom: '60px', paddingTop: '40px' }} />
            }

            {this.props.content_type.model === "ticket" &&
              <div style={{ paddingTop: "40px", paddingBottom: "60px" }}>
                <ConfirmationNumberIcon style={{ fontSize: 94 }} />
              </div>
            }
          </Card>
        </Link>
      </Col>

    )

  }
}



export default WorkflowClassCard;