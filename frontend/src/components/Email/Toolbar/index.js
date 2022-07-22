import React, { useState, useEffect } from 'react';
import './Toolbar.css';
import moment from 'moment';
import { EllipsisOutlined } from '@ant-design/icons';
import { Descriptions, Button, Drawer, List, Popover } from 'antd';

export default function Toolbar(props) {
	const [visible, setVisible] = useState(false);
	let title
	let from
	let to
	let cc
	let date
	let ellipsisbutton = []

	if (props.data !== undefined) {
		console.log(props.data)
		title = props.data.subject
		from = props.data.from
		to = props.data.to
		cc = props.data.cc
		date = moment(props.data.date).format('dddd MMM DD, YYYY h:m a')
	}
	const onClose = () => {
		setVisible(false);
	};

	const fullWidth = global.window.innerWidth * 0.75

	if (cc === null) {
		cc = []
	}

	const content = (
		<div	>
			<p>Subject: {title}</p>
			<p>From: {from}</p>
			<p>To: {to}</p>
			{cc.length > 0
				? <p>Cc: {cc}</p>
				: null
			}
			<p>Date: {date}</p>
		</div>
	)

	console.log('heeeerrrreeeeee')
	console.log(props.data)

	return (
		<div className="toolbar">
			<div className="left-items"></div>
			<h1 className="toolbar-title">{title}</h1>
			{props.data.date
				? <div className="right-items"><Popover style={{ width: "50%" }} content={content} title="Conversation Details" trigger="hover" placement="leftTop"><Button icon={<EllipsisOutlined />} /></Popover></div>
				: null
			}
		</div>
	);
}