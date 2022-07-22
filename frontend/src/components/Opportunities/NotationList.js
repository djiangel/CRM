import React from 'react'
import { List, Comment } from 'antd';
import OpportunityDrawer from './Forms/OpportunityDrawer';
import { useDispatch, useSelector } from 'react-redux'
import { UserOutlined } from '@ant-design/icons';

export default function NotationList(props) {
    const permissions = useSelector(state => state.api.project.permissions);
    return (
        <React.Fragment>
            <List
                className="notation-list"
                itemLayout="horizontal"
                dataSource={props.notations.reverse()}
                renderItem={notation => (
                    <li>
                        <Comment
                            author={notation.userProfile.user.username}
                            avatar={notation.userProfile.profile_picture ?
                                notation.userProfile.profile_picture :
                                <UserOutlined />
                            }
                            content={
                                <React.Fragment>
                                    {notation.sales_notes}
                                    <span style={{ float: 'right' }}>
                                        {permissions['sales.delete_salesnotation'] ?
                                            <OpportunityDrawer data={notation.notation_id}
                                                button_name='Delete Notation'
                                                title='Delete Notation'
                                                component='NotationDelete'
                                                button_type='delete_only' />
                                            :
                                            null
                                        }
                                    </span>
                                </React.Fragment>}
                            datetime={notation.time.slice(0, 10) + ' ' + notation.time.slice(11, 19)}
                        />
                    </li>
                )}
            />
        </React.Fragment>



    )
}

