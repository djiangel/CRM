import React from 'react';
import { Tag, Input, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { connect } from "react-redux";

class EditableTagGroup extends React.Component {

    state = {
        tags: this.props.replyTo,
        inputVisible: false,
        inputValue: '',
        editInputIndex: -1,
        editInputValue: '',
    };

    componentDidUpdate(prevProps) {
        if (this.props.replyTo !== prevProps.replyTo) {
            this.setState({ tags: this.props.replyTo })
        }
    }

    handleClose = removedTag => {
        const tags = this.state.tags.filter(tag => tag !== removedTag);
        console.log(tags);
        this.setState({ tags });
        this.props.changeReplyTo(tags)
    };

    showInput = () => {
        this.setState({ inputVisible: true }, () => this.input.focus());
    };

    handleInputChange = e => {
        this.setState({ inputValue: e.target.value });
    };

    handleInputConfirm = () => {
        const { inputValue } = this.state;
        let { tags } = this.state;
        if (inputValue && tags.indexOf(inputValue) === -1) {
            tags = [...tags, inputValue];
        }
        console.log(tags);
        this.setState({
            tags,
            inputVisible: false,
            inputValue: '',
        });
        this.props.changeReplyTo(tags)
    };

    handleEditInputChange = e => {
        this.setState({ editInputValue: e.target.value });
    };

    handleEditInputConfirm = () => {
        this.setState(({ tags, editInputIndex, editInputValue }) => {
            const newTags = [...tags];
            newTags[editInputIndex] = editInputValue;
            this.props.changeReplyTo(newTags)
            return {
                tags: newTags,
                editInputIndex: -1,
                editInputValue: '',
            };
        });
    };

    saveInputRef = input => {
        this.input = input;
    };

    saveEditInputRef = input => {
        this.editInput = input;
    };

    render() {
        const { tags, inputVisible, inputValue, editInputIndex, editInputValue } = this.state;
        return (
            <>
                {tags.map((tag, index) => {
                    if (editInputIndex === index) {
                        return (
                            <Input
                                ref={this.saveEditInputRef}
                                key={tag}
                                size="small"
                                className="tag-input"
                                value={editInputValue}
                                onChange={this.handleEditInputChange}
                                onBlur={this.handleEditInputConfirm}
                                onPressEnter={this.handleEditInputConfirm}
                            />
                        );
                    }

                    const isLongTag = tag.length > 20;

                    const tagElem = (
                        <Tag
                            className="edit-tag"
                            key={tag}
                            closable
                            onClose={() => this.handleClose(tag)}
                        >
                            <span
                                onDoubleClick={e => {
                                    this.setState({ editInputIndex: index, editInputValue: tag }, () => {
                                        this.editInput.focus();
                                    });
                                    e.preventDefault();
                                }}
                            >
                                {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                            </span>
                        </Tag>
                    );
                    return isLongTag ? (
                        <Tooltip title={tag} key={tag}>
                            {tagElem}
                        </Tooltip>
                    ) : (
                            tagElem
                        );
                })}
                {inputVisible && (
                    <Input
                        ref={this.saveInputRef}
                        type="text"
                        size="small"
                        className="tag-input"
                        value={inputValue}
                        onChange={this.handleInputChange}
                        onBlur={this.handleInputConfirm}
                        onPressEnter={this.handleInputConfirm}
                    />
                )}
                {!inputVisible && (
                    <Tag className="site-tag-plus" onClick={this.showInput}>
                        <PlusOutlined /> New Email
                    </Tag>
                )}
            </>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        changeReplyTo: (to) => dispatch({ type: 'CHANGE_REPLYTO', replyTo: to }),
    }
}

const mapStateToProps = (state) => {
    return {
        replyTo: state.email.replyTo
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditableTagGroup);