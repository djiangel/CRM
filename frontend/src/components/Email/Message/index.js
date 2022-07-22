import React, { useEffect, useState, useRef } from 'react';
import moment from 'moment';
import './Message.css';
import AttachmentView from '../attachment_view.js';
import { PaperClipOutlined } from '@ant-design/icons';

export default function Message(props) {
  const {
    data,
    isMine,
    startsSequence,
    endsSequence,
    showTimestamp
  } = props;

  const iframe = useRef();

  const [contentHeight, setContentHeight] = useState('1px')

  const [attachmentclicked, setAttachmentClicked] = useState({})

  const [visible, setVisible] = useState(false)

  const [attachments, setAttachments] = useState([])

  const [iframeClass, setiframeClass] = useState(false)

  const [seeMore, setSeeMore] = useState(false)

  const [seeLess, setSeeLess] = useState(false)


  const setiframe = () => {
    setiframeClass(false)
    setSeeLess(false)
    setSeeMore(false)
    let hidethis = iframe.current.contentWindow.document.getElementsByClassName("gmail_quote")
    console.log(hidethis)
    for (let i = 0; i < hidethis.length; i++) {
      hidethis[i].className += " hide_this"
    }
    console.log(hidethis)
    let body = iframe.current.contentWindow.document.body
    if (isMine === true) {
      let body = iframe.current.contentWindow.document.body
      body.style.color = 'white';
    }
    body.style.fontFamily = 'helvetica';
    body.style.fontWeight = 'lighter'
    iframe.current.contentWindow.document.body.innerHTML = iframe.current.contentWindow.document.body.innerHTML + '<style>.hide_this {display: none;}</style>';
    let height = iframe.current.contentWindow.document.body.scrollHeight + 15
    if (height > document.documentElement.clientHeight * 0.4) {
      console.log('have a see more')
      console.log(height)
      setSeeMore(true)
    }
    else if (hidethis.length > 0) {
      setSeeMore(true)
    }

    else {
      setSeeMore(false)
      setSeeLess(false)
    }
    setContentHeight(height + 'px');
  }


  const friendlyTimestamp = moment(data.date).format('LLLL');


  const propsdata = props

  let tempattachments = []

  useEffect(() => {
    displayAttachments();
  }, [data])

  const handleAttachmentClick = (attachmentclick) => {
    setAttachmentClicked(attachmentclick)
    setVisible(true)
  }

  const handleAttachmentCancel = () => {
    setVisible(false)
  }

  const displayAttachments = () => {
    setAttachments([])
    if (props.data.attachment.length > 0) {
      for (let i = 0; i < props.data.attachment.length; i++) {
        tempattachments.push(<div className={['attachment', `${isMine ? 'mine' : ''}`].join(' ')} onClick={() => handleAttachmentClick(props.data.attachment[i])} key={props.data.attachment[i].data}><PaperClipOutlined /><span>{props.data.attachment[i].filename}</span></div>)
        setAttachments(tempattachments)
      }
    }
  }

  const handleSeeMore = (e) => {
    e.preventDefault();
    console.log('see more')
    setiframeClass(true)
    setSeeMore(false)
    let details = iframe.current.contentWindow.document.getElementsByClassName("hide_this")
    console.log(details)
    for (let i = 0; i < details.length; i++) {
      details[i].classList.remove("hide_this")
      i -= 1
    }
    console.log(details)
    let height = iframe.current.contentWindow.document.body.scrollHeight + 15
    setContentHeight(height + 'px');
    setSeeLess(true)
  }

  const handleHideDetails = (e) => {
    e.preventDefault();
    console.log('hide details')
    setiframeClass(false)
    setSeeMore(true)
    let details = iframe.current.contentWindow.document.getElementsByClassName("gmail_quote")
    console.log(details)
    for (let i = 0; i < details.length; i++) {
      details[i].classList.add("hide_this")
    }
    console.log(details)
    let height = iframe.current.contentWindow.document.body.scrollHeight + 15
    setContentHeight(height + 'px');
    setSeeLess(false)
  }

  const body = data.body

  let from

  if (isMine === false) {
    if (data.from.emailAddress) {
      from = data.from.emailAddress.address
    }
    else {
      from = data.from
    }
  }

  return (
    <div className={[
      'message',
      `${isMine ? 'mine' : ''}`,
    ].join(' ')}>
      {
        showTimestamp &&
        <div className="timestamp">
          {friendlyTimestamp}
        </div>
      }
      <div className="bubble-container">
        <div className="bubble" title={friendlyTimestamp}>
          <iframe srcDoc={body} ref={iframe} frameBorder="0" onLoad={setiframe} height={contentHeight} width="100%" scrolling="no" className={iframeClass ? 'seemore' : null}></iframe>
          <div style={{ textAlign: 'center' }} className={seeMore ? null : 'hidden'}>
            <a href="#" onClick={handleSeeMore} style={{ display: 'block', color: '#2F4F4F' }}>
              See More
            </a>
          </div>
          <div style={{ textAlign: 'center' }} className={seeLess ? null : 'hidden'}>
            <a href="#" onClick={handleHideDetails} style={{ display: 'block', color: '#2F4F4F' }}>
              Hide Details
            </a>
          </div>
        </div>
      </div>
      {attachments}
      {from}
      <AttachmentView attachment={attachmentclicked}
        visible={visible}
        handleCancel={handleAttachmentCancel} />
    </div>
  );
}