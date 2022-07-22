import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import base64url from "base64url";
import { Page, Text, View, Document, StyleSheet, pdfjs } from 'react-pdf';
import { PageHeader, Modal, Button } from 'antd';
import {AppModel} from './app_model.js';
import Base64Downloader from 'react-base64-downloader';
import Viewer, { Worker } from '@phuocng/react-pdf-viewer';
import '@phuocng/react-pdf-viewer/cjs/react-pdf-viewer.css';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
class AttachmentView extends Component {

	constructor(props) {
		super(props)
		this.state = {
			objectURL: '',
			numPages: null,
			pageNumber: 1,
		}
	}
	
	onDocumentLoadSuccess = ({ numPages }) => {
    	this.setState({numPages: numPages });
  	}

  	base64toBlob = (data: string, type) => {
        // Cut the prefix `data:application/pdf;base64` from the raw base 64
        let base64WithoutPrefix = data.substr(`data:${type};base64,`.length);

        let bytes = atob(base64WithoutPrefix);
        let length = bytes.length;
        let out = new Uint8Array(length);
    
        while (length--) {
            out[length] = bytes.charCodeAt(length);
        }

        return new Blob([out], { type: type });
    };

	render() {
		let imageurl;
		let imagedata;
		let type;
		let objectURL;
		let encoded;
		let pdfurl;
		let filename;
		let length;
		let bytes;
		let out;
		let url;

		if (this.props.visible) {
			if (this.props.attachment.type.includes('image')) {
				encoded = this.props.attachment.data.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '')
				type = this.props.attachment.type
				imageurl = "data:" + type + ";base64," + encoded
				filename = this.props.attachment.filename.split('.')[0];
				return (
					<Modal
			          visible={this.props.visible}
			          title={this.props.attachment.filename}
			          onCancel={this.props.handleCancel}
			          width={'85vw'}
			          bodyStyle={{height: '80vh', overflow: 'auto'}}
			          style={{ top: '1%' }}
			          footer={[
			            <Button key="back" onClick={this.props.handleCancel}>
			              Return
			            </Button>, <Button><Base64Downloader
					    base64={imageurl}
					    downloadName={filename}
					    Tag="a"
					    style={{ color: 'orange' }}
					    onDownloadSuccess={() => console.log('File download initiated')}
					    onDownloadError={() => console.warn('Download failed to start')}
					>
						Download
					</Base64Downloader></Button>
			          ]}
			        >
			          <img src={imageurl} style={{width:'100%', height:'100%', objectFit:'scale-down'}}/>
			        </Modal>
				)
			}

			if (this.props.attachment.type.includes('pdf')) {
				encoded = this.props.attachment.data.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '')
				type = this.props.attachment.type
				pdfurl = "data:" + type + ";base64," + encoded
				url = URL.createObjectURL(this.base64toBlob(pdfurl,type));
				return (
					<Worker workerUrl="https://unpkg.com/pdfjs-dist@2.4.456/build/pdf.worker.min.js">
						<Modal
				          visible={this.props.visible}
				          title={this.props.attachment.filename}
				          onCancel={this.props.handleCancel}
				          width={'85vw'}
				          bodyStyle={{height: '80vh', overflow: 'auto'}}
				          style={{ top: '1%' }}
				          footer={[
				            <Button key="back" onClick={this.props.handleCancel}>
				              Return
				            </Button>,<Button><a download={this.props.attachment.filename} href={pdfurl} style={{ color: 'orange' }}>Download</a></Button>
				          ]}
				        >
				        	<Viewer fileUrl={url} />        
				        </Modal>
				    </Worker>
				)
			}
		}

		if (this.props.visible == false) {
			return (
					null
				)
		}

	}
}

export default AttachmentView;