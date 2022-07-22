import React from 'react'
import { Link } from 'react-router-dom';
import { Button } from 'antd';

export default function SalesProjectListRow(props) {
    return (
        <React.Fragment>
            <tr>
                <td><Button type='primary' shape='circle'><Link to={`/project/detail/${props.sales_project_id}`}>{props.sales_project_id}</Link></Button></td>
                <td>{props.sales_project_name}</td>
                <td>{props.sales_project_est_rev_currency} {props.sales_project_est_rev}</td>
                <td>
                    <div className="display: inline-block">
                         <p key={props.customerInformation.customer_id}>{props.customerInformation.customer_name}</p>
                    </div>
                </td>
                <td>
                    <div className="display: inline-block">
                        {props.userProfile.map(s => (<p key={s.id}>{s.user.username}</p>))}
                    </div>
                </td>
                <td>{props.status}</td>
                <td>{props.sales_project_last_date}</td>
            </tr>
        </React.Fragment>
    )
}
