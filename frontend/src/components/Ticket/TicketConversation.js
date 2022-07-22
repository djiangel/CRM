import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Message from '../Email/Message';
import Reply from '../Email/Compose';
import moment from 'moment';
import { ArrowRightOutlined, InboxOutlined, PlusOutlined } from '@ant-design/icons';
import { GmailController } from '../../api/gmail_controller.js';
import { Alert, Input, Upload, message, Form, Button, Drawer, Tag, Tooltip } from 'antd';
import EditableTagGroup from '../Email/Compose/tabgroup';
import axiosInstance from '../../api/axiosApi';
import Messenger from '../Email/Messenger';

export default function TicketConversation() {
    let replybutton
    let assigneduser
    const [messages, setMessages] = useState([])
    const gmailController = new GmailController()
    const { TextArea } = Input;
    const { Dragger } = Upload;
    const dispatch = useDispatch()
    const [form] = Form.useForm();
    const [body, setBody] = useState('');
    const [attachment, setAttachment] = useState([]);
    const [replySubject, setSubject] = useState('')
    const [visible, setVisible] = useState(false);
    const replyTo = useSelector(state => state.email.replyTo)
    const ticket = useSelector(state => state.ticket.ticket)
    const user = useSelector(state => state.auth.userprofile)
    const ticketSubject = useSelector(state => state.ticket.ticket.title)
    const ticketEmail = useSelector(state => state.ticket.ticket.email)
    const ticketId = useSelector(state => state.ticket.ticket.id)
    const fullWidth = global.window.innerWidth * 0.75
    const userId = useSelector(state => state.auth.userprofile)
    const ticketassignedto = useSelector(state => state.ticket.ticket.assigned_to.id)

    if (userId === ticketassignedto) {
        assigneduser = true
    }
    else {
        assigneduser = false
    }

    useEffect(() => {
        dispatch({ type: 'CHANGE_REPLYTO', replyTo: [ticketEmail] })
        dispatch({ type: 'CHANGE_THREADID', threadid: '' })
        axiosInstance.get(`/assigned-email/getbasedonticket/?ticketId=${ticketId}`).then((response) => {
            setMessages(response.data)
        }).catch((error) => {
            console.log(error)
        })
    }, [])

    /* const renderMessages = () => {
        let i = 0;
        let messageCount = messages.length;
        let tempMessages = [];
        while (i < messageCount) {
            messages = messages.sort((a, b) => {
                console.log(a)
                console.log(b)
                return moment(a.date).diff(b.date)
            })
            let previous = messages[i - 1];
            let current = messages[i];
            let next = messages[i + 1];
            let isMine = current.label === "SENT";
            let currentMoment = moment(current.date);
            let prevBySameAuthor = false;
            let nextBySameAuthor = false;
            let startsSequence = true;
            let endsSequence = true;
            let showTimestamp = true;

            if (previous) {
                let previousMoment = moment(previous.date);
                let previousDuration = moment.duration(currentMoment.diff(previousMoment));
                prevBySameAuthor = previous.from === current.from;

                if (prevBySameAuthor && previousDuration.as('hours') < 1) {
                    startsSequence = false;
                }

                if (previousDuration.as('hours') < 1) {
                    showTimestamp = false;
                }
            }

            if (next) {
                let nextMoment = moment(next.date);
                let nextDuration = moment.duration(nextMoment.diff(currentMoment));
                nextBySameAuthor = next.from === current.from;

                if (nextBySameAuthor && nextDuration.as('hours') < 1) {
                    endsSequence = false;
                }
            }

            tempMessages.push(
                <Message
                    key={i}
                    isMine={isMine}
                    startsSequence={startsSequence}
                    endsSequence={endsSequence}
                    showTimestamp={showTimestamp}
                    data={current}
                />
            );

            // Proceed to the next message.
            i += 1;

        }

        return tempMessages;
    } 

    if (ticket.assigned_to.id === user) {
        replybutton = <Reply replySubject={replySubject} replyTo={replyTo} message={messages} />
    } */

    const handleCreate = () => {
        setVisible(true);
    }

    const onClose = () => {
        setVisible(false);
    };

    const formItemLayout = {
        labelCol: {
            sm: { span: 3 },
        },
        wrapperCol: {
            sm: { span: 20 },
        },
    };

    const normFile = e => {

        if (Array.isArray(e)) {
            return e;
        }

        return e && e.fileList;
    };

    const handleChange = (changedValues, allValues) => {

        setSubject(allValues.subject)
        setBody(allValues.message)
    }

    const handleSendEmail = (email) => {
        gmailController.sendEmail(email).then((response) => {

            gmailController.getSpecificConversation(response.threadId).then((response) => {
                let assignedemail = {}
                let assignedmessage = [response]
                assignedemail.content = JSON.stringify(response)
                assignedemail.emailId = response[0].threadid
                assignedemail.ticket = ticketId
                axiosInstance.post(`/assigned-email/`, assignedemail).then((response) => {
                    message.success('Successfully Assigned');
                    setMessages(assignedmessage)
                }).catch(error => {
                    console.log(error)
                })
                setVisible(false)
            })
        })
    }

    const handleAttachment = (info) => {
        const { status } = info.file;
        if (status !== 'uploading') {
            let reader = new FileReader();
            reader.onload = (e) => {
                info.file.data = e.target.result;
            }
            reader.readAsDataURL(info.file.originFileObj);
        }
        if (status === 'done') {
            let tempattachment = []
            tempattachment.push(info.file)
            setAttachment(tempattachment)
            message.success(`${info.file.name} file uploaded successfully.`);
        } else if (status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    }

    const handleSend = () => {
        let replyemail
        replyemail = {
            to: replyTo,
            subject: replySubject,
            body: body,
            attachment: attachment,
        }
        handleSendEmail(replyemail)
    }

    let createbutton = <a href="#" onClick={handleCreate}>here</a>

    let tempreplyto = []
    tempreplyto.push(replyTo)

    if (messages.length > 0) {
        return (
            <Messenger messages={messages} assigneduser={assigneduser} from="ticket" />
        )
    }

    else {
        return (
            <div>
                <Alert message={<React.Fragment>Create a new Email Thread assigned to this ticket {createbutton}.</React.Fragment>} description="Email will be sent to Customer's Email Address by default." type="info" />
                <Drawer
                    title="Compose Email"
                    placement="right"
                    closable={false}
                    onClose={onClose}
                    visible={visible}
                    width={fullWidth}
                >
                    <Form
                        form={form}
                        {...formItemLayout}
                        name="register"
                        onFinish={handleSend}
                        onValuesChange={handleChange}
                        scrollToFirstError
                    >
                        <Form.Item
                            name="email"
                            label="To"
                        >
                            <EditableTagGroup type="reply" />
                        </Form.Item>
                        <Form.Item
                            name="subject"
                            label="Subject"
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="message"
                            label="Message"
                        >
                            <TextArea autoSize={{ minRows: 8, maxRows: 10 }} />
                        </Form.Item>
                        <Form.Item label="Attachment">
                            <Form.Item name="attachment" valuePropName="fileList" getValueFromEvent={normFile} noStyle>
                                <Upload.Dragger name="file"
                                    multiple
                                    action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                                    onChange={handleAttachment}
                                    onRemove={null}>
                                    <p className="ant-upload-drag-icon">
                                        <InboxOutlined />
                                    </p>
                                    <p className="ant-upload-text">Click or drag file to this area to upload</p>
                                    <p className="ant-upload-hint">Drop your attachments here</p>
                                </Upload.Dragger>
                            </Form.Item>
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Send
                            </Button>
                        </Form.Item>
                    </Form>
                </Drawer>
            </div>
        )
    }
}