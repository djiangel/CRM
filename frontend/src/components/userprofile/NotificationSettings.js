import React, { Component, Fragment } from 'react'
import DynamicForm from '../../components/Application/DynamicForm';
import { connect } from "react-redux";

class NotificationSettings extends Component {

    onSubmit = (data) => {
        this.props.updateUserprofile(this.props.auth,data)
    };

    render() {
        const { user , department , email , email_password, profile_picture , contact_number , id , salesAccount , ...newdata } = this.props.userprofile;
        return (
            <Fragment>
                <div>
                    <p><b>When shall we Email you?</b></p>
                </div>
                <br />
                {this.props.userprofile ?
                    <DynamicForm className="form"

                        type="update"
                        model={[
                            { key: "project_created", label: "Project created" ,type: "radio" },
                            { key: "project_updated", label: "Project Updated",type: "radio"},
                            { key: "requirements_created", label: "Project Requirements Created",type: "radio"},
                            { key: "requirements_updated", label: "Project Requirements Updated", type: "radio" },
                            { key: "requirements_deleted", label: "Project Requirements Deleted",type: "radio" },

                            { key: "notations_created", label: "Project Notation created",type: "radio"  },
                            { key: "notations_updated", label: "Project Notation Updated",type: "radio"  },
                            { key: "notations_deleted", label: "Project Notation deleted",type: "radio" },

                            { key: "ticket_created", label: "Ticket created" ,type: "radio" },
                            { key: "ticket_updated", label: "Ticket Updated" ,type: "radio" },
                            { key: "ticket_approved", label: "Ticket Approved",type: "radio" },

                            { key: "customer_created", label: "Customer created",type: "radio"  },
                            { key: "customer_updated", label: "Customer Updated" ,type: "radio" },
                            { key: "customer_approved", label: "Customer Approved",type: "radio"  },

                            
                            { key: "vendor_created", label: "Vendor created" ,type: "radio" },
                            { key: "vendor_updated", label: "Vendor Updated",type: "radio"   },
                            { key: "vendor_approved", label: "Vendor Approved",type: "radio"  },


                            { key: "approval_created", label: "Workflow Approval created" ,type: "radio"  },
                            { key: "approval_deleted", label: "Workflow Approval deleted",type: "radio"  },
                            { key: "approval_reordered", label: "Workflow Approvals reordered",type: "radio"  },

                            
                            { key: "transition_created", label: "Workflow transition created",type: "radio"  },
                            { key: "transition_deleted", label: "Workflow transition deleted" ,type: "radio" },

                            { key: "automation_created", label: "Workflow automation created",type: "radio"  },
                            { key: "automation_deleted", label: "Workflow automation deleted",type: "radio"  },
                        ]}

                        data={newdata}

                        addon={[]}

                        onSubmit={(data) => { this.onSubmit(data) }}
                    /> : null}
            </Fragment>
        )
    }
}
const mapStateToProps = state => {
    return {
        userprofile: state.userprofile.userprofile,
        auth: state.auth.userprofile,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateUserprofile: (id,data) => dispatch({ type: 'UPDATE_USERPROFILE', id: id , data:data})
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(NotificationSettings);