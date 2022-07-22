import React, { Component } from 'react'
import DynamicForm from '../../components/Application/DynamicForm';
import { connect } from "react-redux";
import { Layout } from 'antd';

class GeneralSettings extends Component {

    onSubmit = (data) => {
        let formData = new FormData();
        formData.append("username", data.username);
        formData.append("contact_number", data.contact_number);
        if (data.profile_picture && typeof data.profile_picture !== 'string') {
            formData.append("profile_picture", data.profile_picture);
        }
        this.props.updateUserprofile(this.props.auth, formData)
    };

    render() {
        const profile = {
            "username": this.props.userprofile.user.username,
            "contact_number": this.props.userprofile.contact_number,
            "profile_picture": this.props.userprofile.profile_picture,
        }
        return (
            <React.Fragment>
                <div>
                    <p><b>General Settings</b></p>
                </div>
                <br />
                {profile ?
                    <DynamicForm className="form"

                        type="update"
                        model={[
                            { key: "username", label: "Username" },
                            { key: "contact_number", label: "Contact" },
                            { key: "profile_picture", label: "Profile Picture", type: "profile_picture" },
                        ]}

                        data={profile}

                        addon={[]}

                        onSubmit={(data) => { this.onSubmit(data) }}
                    /> : null}
            </React.Fragment>
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
        updateUserprofile: (id, data) => dispatch({ type: 'UPDATE_USERPROFILE', id: id, data: data })
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GeneralSettings);

