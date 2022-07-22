import React, { Component, useCallback, forwardRef } from 'react'
import "antd/dist/antd.css";
import { Form, Input, Button, Col, Spin, DatePicker, Alert, Select, InputNumber, Switch } from "antd";
import { MinusCircleTwoTone, PlusOutlined } from "@ant-design/icons";
import moment from 'moment';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './../Calendar/TaskForm.css'
import { MentionsInput, Mention } from 'react-mentions'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import './form.css'
import MoonLoader from "react-spinners/MoonLoader";
import { connect } from 'react-redux';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

var convert = require('convert-units')

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};

class DynamicForm extends Component {

    state = {
        error: {},
        crop: {
            aspect: 1 / 1
        }
    }

    handleData = () => {

        if (this.props.data) {

            let data = this.props.data;

            let fieldKeys = [];

            for (let i = 0, l = this.props.model.length; i < l; i++) {
                if (this.props.model[i].currency_key) {
                    fieldKeys.push(this.props.model[i].currency_key)
                }
                if (this.props.model[i].start_key) {
                    fieldKeys.push(this.props.model[i].start_key)
                    fieldKeys.push(this.props.model[i].end_key)
                }
                else {
                    fieldKeys.push(this.props.model[i].key)
                }
            }

            if (this.props.addon) {
                for (let i = 0, l = this.props.addon.length; i < l; i++) {
                    fieldKeys.push(this.props.addon[i].model)
                }
            }

            let dataKeys = Object.keys(this.props.data)
            for (let i = 0; i < dataKeys.length; i++) {
                if (!fieldKeys.includes(dataKeys[i])) {
                    delete data[dataKeys[i]]
                }
            }

            if (this.props.addon) {
                for (let i = 0, l = this.props.addon.length; i < l; i++) {
                    if (!dataKeys.includes(this.props.addon[i].model)) {
                        data[this.props.addon[i].model] = []
                    }
                }
            }

            this.setState({ data: data })
        }

        else {
            this.setState({ data: {} })
            for (var i = 0, l = this.props.addon.length; i < l; i++) {
                this.setState({ data: { ...this.state.data, [this.props.addon[i].model]: [] } })
            }
        }
    }

    componentDidMount() {
        /*let data = {};
        for (let i = 0, l = this.props.model.length; i < l; i++) {
            data[this.props.model[i].key] = '';
        }
        for (let i = 0, l = this.props.addon.length; i < l; i++) {
            data[this.props.addon[i].model] = {};
            for (let z = 0; z < this.props.addon[i].fields.length; z++) {
                data[this.props.addon[i].model][this.props.addon[i].fields[z].key] = ''
            }
        }
        this.setState({ data: data })*/
        this.handleData()

    }

    componentDidUpdate(prevProps) {
        if (prevProps.response !== this.props.response) {
            this.handleResponse();
        }
        if (prevProps.data !== this.props.data || prevProps.clearData !== this.props.clearData) {
            this.handleData()
        }
    }

    handleResponse = () => {
        let model = this.props.model;
        let response = this.props.response;
        model.map((m) => {
            let key = m.key;
            let validation = '';

            if (response[key]) {
                for (let i = 0; i < response[key].length; i++) {
                    validation = validation + '\n' + response[key]
                }
            }
            validation !== this.state.error[key] && this.setState({ error: { ...this.state.error, [key]: validation } })
        });
    }

    onSelectFile = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () =>
                this.setState({ src: reader.result })
            );
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    onCropChange = (crop, percentCrop) => {
        this.setState({ crop })
    };

    onCropComplete = (crop, key) => {
        this.makeClientCrop(crop, key);
    }

    onImageLoaded = image => {
        this.imageRef = image;
    };

    async makeClientCrop(crop, key) {
        if (this.imageRef && crop.width && crop.height) {
            let croppedImageUrl = await this.getCroppedImg(
                this.imageRef,
                crop,
                'newFile.jpeg'
            );
            const myFile = new File([croppedImageUrl], 'profile_picture.jpeg', { type: croppedImageUrl.type })
            this.setState({ data: { ...this.state.data, [key]: myFile } })
        }
    }

    getCroppedImg(image, crop, fileName) {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob(blob => {
                if (!blob) {
                    //reject(new Error('Canvas is empty'));
                    return;
                }
                blob.name = fileName;
                resolve(blob);
            }, 'image/jpeg');
        });
    }


    renderForm = () => {
        let model = this.props.model;

        let formUI = model.map((m) => {
            let key = m.key;
            let type = m.type || "text";
            let input;
            let finalOptions;
            if (type === "text") {
                input = <Input key={"i" + m.key} name={m.key} onChange={this.onChange} value={this.state.data[m.key]} placeholder="Input text" />
            }
            else if (type === "money") {
                let options = m.options;
                finalOptions = options.length ? options.map((option) => (
                    <Option key={option[0]} value={option[0]}>{option[0]}</Option >
                )) : null;

                input =
                    <Input.Group compact>
                        <Select
                            showSearch
                            key={"icurrency"}
                            style={{ width: '15%' }}
                            name={m.currency_key}
                            value={this.state.data[m.currency_key]}
                            placeholder="Currency"
                            onChange={(value) => this.onChangeSelect(value, m.currency_key)}
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }>
                            {finalOptions}
                        </Select>
                        <InputNumber
                            step={0.01}
                            style={{ width: '85%' }}
                            value={this.state.data[m.key]}
                            formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={val => val.replace(/\$\s?|(,*)/g, '')}
                            onChange={(val) => this.onChangeNumber(val, m.key)}
                        />
                    </Input.Group>
            }

            else if (type === "phone_number") {
                input =
                    <PhoneInput
                        value={this.state.data[m.key]}
                        onChange={(value) => this.onChangePhone(value, m.key)}
                        inputClass="ant-input"
                        enableSearch
                        placeholder="+65 9123-4567"
                    />
            }

            else if (type === "text_area") {
                input = <TextArea key={"i" + m.key} name={m.key} onChange={this.onChange} value={this.state.data[m.key]} autoSize placeholder="Input text" />
            }
            else if (type === "text_autocomplete") {
                let form = m.autocomplete
                return (
                    <MentionsInput style={{
                        input: {
                            overflow: 'auto',
                            height: 200,
                        },
                        highlighter: {
                            boxSizing: 'border-box',
                            overflow: 'hidden',
                            height: 200,
                        },
                    }}
                        className='comments-textarea'
                        placeholder={"Mention people using '@'"}
                        value={this.state.data.content}
                        onChange={(e) => this.onChangeNumber(e.target.value, m.key)}>
                        <Mention
                            trigger='@'
                            markup="@[__display__](user:__id__)"
                            data={form.users}
                            className='comments-textarea'
                            style={{
                                backgroundColor: '#daf4fa'
                            }}
                        />
                        <Mention
                            trigger='#'
                            markup="@[__display__](project:__id__)"
                            data={form.projects}
                            className='comments-textarea'
                            style={{
                                backgroundColor: '#daf4fa'
                            }}
                        />
                        <Mention
                            trigger='$'
                            data={form.customers}
                            markup="@[__display__](customer:__id__)"
                            className='comments-textarea'
                            style={{
                                backgroundColor: '#daf4fa'
                            }}
                        />
                        <Mention
                            trigger='!'
                            markup="@[__display__](vendor:__id__)"
                            data={form.vendors}
                            className='comments-textarea'
                            style={{
                                backgroundColor: '#daf4fa'
                            }}
                        />
                    </MentionsInput>
                )
            }

            else if (type === "number") {
                input = <InputNumber key={"i" + m.key} name={m.key} onChange={(value) => this.onChangeNumber(value, m.key)} value={this.state.data[m.key]} style={{ width: '100%' }} placeholder="Input a number" />
            }


            else if (type === "file") {
                input = <Input type={type} key={"i" + m.key} name={m.key} onChange={this.onChangeFile} />
            }

            else if (type === 'profile_picture') {
                input =
                    <React.Fragment><Input accept="image/*" type='file' key={"i" + m.key} name={m.key} onChange={this.onSelectFile} />
                        {this.state.src && (
                            <ReactCrop
                                src={this.state.src}
                                crop={this.state.crop}
                                ruleOfThirds
                                onChange={this.onCropChange}
                                onComplete={(crop) => this.onCropComplete(crop, m.key)}
                                onImageLoaded={this.onImageLoaded}
                            />
                        )}
                        {this.state.croppedImageUrl && (
                            <img alt="Crop" style={{ maxWidth: '100%' }} src={this.state.croppedImageUrl} />
                        )}
                    </React.Fragment>
            }

            else if (type === 'radio') {
                input = <Switch key={"i" + m.key} onChange={(value) => this.onChangeSelect(value, m.key)} checked={this.state.data[m.key]} />
            }

            else if (type === "select") {
                let options = m.options;
                finalOptions = options.map((option) => (
                    <Option key={"o" + option} value={option}>{option}</Option >
                ));
                input =
                    <Select
                        showSearch
                        style={{ width: '100%' }}
                        key={"i" + m.key}
                        name={m.key}
                        onChange={(value) => this.onChangeSelect(value, m.key)}
                        placeholder="Select option"
                        value={this.state.data[m.key]}
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {finalOptions}
                    </Select>
            }

            else if (type === "fkey") {
                let options = m.options;
                finalOptions = options.length ? options.map((option) => (
                    <Option key={option[m.id]} value={option[m.id]}>{option[m.name]}</Option >
                )) : null;
                input =
                    <Select
                        showSearch
                        style={{ width: '100%' }}
                        key={"i" + m.key}
                        name={m.key}
                        onChange={(value) => this.onChangeSelect(value, m.key)}
                        placeholder="Select option"
                        value={this.state.data[m.key]}
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {finalOptions}
                    </Select >
            }

            else if (type === 'm2m') {
                let options = m.options;
                finalOptions = options.length ? options.map((option) => (
                    <Option key={option[m.id]} value={option[m.id]}>{option[m.name]}</Option >
                )) : null;
                input =
                    <Select
                        mode="multiple"
                        showSearch
                        style={{ width: '100%' }}
                        key={"i" + m.key}
                        name={m.key}
                        onChange={(value) => this.onChangeM2M(value, m.key)}
                        placeholder="Select option"
                        value={this.state.data[m.key]}
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {finalOptions}
                    </Select>
            }

            else if (type === 'datetime' || type === 'date') {
                let dateFormat = type === 'datetime' ? 'YYYY-MM-DD hh:mm:ss' : 'YYYY-MM-DD'
                input = <DatePicker
                    showTime={type === 'datetime' ? true : false}
                    key={"i" + m.key} name={m.key}
                    onChange={(value, dateString) => this.onChangeDateTime(value, dateString, m.key)}
                    format={dateFormat}
                    value={this.state.data[m.key] ? moment(this.state.data[m.key]) : this.setState({ data: { ...this.state.data, [m.key]: moment().format(dateFormat) } })} />
            }

            else if (type === 'month') {
                let dateFormat = 'YYYY-MM'
                input = <DatePicker
                    key={"i" + m.key} name={m.key}
                    onChange={(value, dateString) => this.onChangeDateTime(value, dateString + '-01', m.key)}
                    format={dateFormat}
                    picker='month'
                    value={this.state.data[m.key] ? moment(this.state.data[m.key].slice(0, 7)) : null
                    } />
            }

            else if (type === 'month_range') {
                let dateFormat = 'YYYY-MM'
                input = <RangePicker picker="month"
                    key={"i" + m.start_key} name={m.start_key}
                    format={dateFormat}
                    onChange={(values, dateStrings) => this.onChangeRange(values, dateStrings, m.start_key, m.end_key)}
                    value={this.state.data[m.start_key] ? [moment(this.state.data[m.start_key].slice(0, 7)), moment(this.state.data[m.end_key].slice(0, 7))]
                        : null
                    }
                />
            }

            else if (type === 'quarter') {
                let arr = this.state.data[m.key] ? this.state.data[m.key].split('-') : null;
                let month;
                if (arr) {
                    month = arr[1] === 'Q1' ? '01' : arr[1] === 'Q2' ? '04' : arr[1] === 'Q3' ? '07' : '10'
                }
                input = <DatePicker picker='quarter' key={"i" + m.key} name={m.key} onChange={(value, dateString) => this.onChangeDateTime(value, dateString, m.key)}
                    value={arr ? moment(`${arr[0]}-${month}-01`, 'YYYY-MM-DD') : null} />
            }

            else if (type === 'length' || type === 'mass' || type === 'area' || type === 'volume') {
                let options = convert().possibilities(type)
                finalOptions = options.map((option) => (
                    <Option key={"o" + option} value={option}>{option}</Option >
                ));
                input =
                    <Input.Group compact>
                        <InputNumber
                            key={"i" + m.key}
                            name={m.key}
                            onChange={(value) => this.onChangeSplit(value, m.key, 0, " ", 2)}
                            value={this.state.data[m.key] ? this.state.data[m.key].split(" ")[0] === "!" ? null : this.state.data[m.key].split(" ")[0] : null}
                            style={{ width: '80%' }}
                            placeholder="Input a number" />
                        <Select
                            showSearch
                            style={{ width: '20%' }}
                            key={"i" + m.key}
                            name={m.key}
                            onChange={(value) => this.onChangeSplit(value, m.key, 1, " ", 2)}
                            placeholder="Select option"
                            value={this.state.data[m.key] ? this.state.data[m.key].split(" ")[1] === "!" ? null : this.state.data[m.key].split(" ")[1] : null}
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {finalOptions}
                        </Select>
                    </Input.Group>
            }

            return (
                <div key={key} className="form-group">
                    <label key={"l" + m.key} htmlFor={m.key} style={{ width: '100%' }}>
                        {m.label}{!m.blank && <span style={{ color: '#FF0000', marginLeft: '5px' }}>*</span>}
                        {m.add && <span style={{ float: 'right' }}>{m.add}</span>}
                    </label>
                    {input}
                    {this.state.error[key] && <Alert message={`Error: ${this.state.error[key]}`} type="error" showIcon />}
                </div>
            );
        });
        return formUI;

    }

    addRow = (model) => {
        let dataAddOn = this.state.data[model] || [];
        dataAddOn.push({});
        this.setState({ data: { ...this.state.data, [model]: dataAddOn } });
    }

    removeRow = (model, index) => {
        let dataAddOn = this.state.data[model]
        dataAddOn.splice(index, 1);
        this.setState({ data: { ...this.state.data, [model]: dataAddOn } });
    }

    onChangeAddOn = (e, index, model, key) => {
        var dataAddOn = [...this.state.data[model]];
        try {
            dataAddOn[index][e.target.name] = e.target.value;
        }
        catch {
            dataAddOn[index][key] = e;
        }
        this.setState({ data: { ...this.state.data, [model]: dataAddOn } });
    };

    renderAddOn = (addon) => {
        const rowPercent = 100 / addon.fields.length;
        let finalOutput = this.state.data[addon.model].map((row) => {
            let index = this.state.data[addon.model].indexOf(row);
            let rowData = addon.fields.map((a) => {
                let input;
                if (a.type === 'fkey') {
                    let options = a.options;
                    let finalOptions = options.length ? options.map((option) => (
                        <Option key={option[a.id]} value={option[a.id]}>{option[a.name]}</Option >
                    )) : null;
                    input =
                        <Select
                            showSearch
                            style={{ width: '100%' }}
                            key={"i" + a.key}
                            name={a.key}
                            onChange={(value) => this.onChangeAddOn(value, index, addon.model, a.key)}
                            placeholder="Select option"
                            value={this.state.data[addon.model][index][a.key]}
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {finalOptions}
                        </Select >
                }
                else if (a.type === "select") {
                    let options = a.options;
                    let finalOptions = options.map((option) => (
                        <Option key={"o" + option} value={option}>{option}</Option >
                    ));
                    input =
                        <Select
                            showSearch
                            style={{ width: '100%' }}
                            key={"i" + a.key}
                            name={a.key}
                            onChange={(value) => this.onChangeAddOn(value, index, addon.model, a.key)}
                            placeholder="Select option"
                            value={this.state.data[addon.model][index][a.key]}
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {finalOptions}
                        </Select>
                }
                else if (a.type === 'radio') {
                    input = <Switch key={"i" + a.key} onChange={(value) => this.onChangeAddOn(value, index, addon.model, a.key)} checked={this.state.data[addon.model][index][a.key]} />
                }
                else if (a.type === "phone_number") {
                    input =
                        <PhoneInput
                            value={this.state.data[addon.model][index][a.key]}
                            onChange={(value) => this.onChangeAddOn('+' + value, index, addon.model, a.key)}
                            inputClass="ant-input"
                            enableSearch
                            style={{ width: '100%' }}
                            placeholder="+65 9123-4567"
                        />
                }
                else {
                    input = <Input placeholder={a.label} name={a.key} key={'i' + a.key} onChange={(e) => this.onChangeAddOn(e, index, addon.model)}
                        value={this.state.data[addon.model][index][a.key]} placeholder="Input text" />
                }
                return (
                    <div key={'c' + a.key} className='dynamic-form-field-col'>
                        <label key={"l" + a.key} htmlFor={a.key} style={{ width: '100%' }}>
                            {a.label}
                        </label>
                        {input}
                    </div>
                )

            })
            return (
                <div key={index} className='dynamic-form-row'>
                    {rowData}
                    <Button type='primary' danger onClick={() => this.removeRow(addon.model, index)}
                        className='dynamic-form-remove-row'>
                        <MinusCircleTwoTone
                            twoToneColor='red'
                        /> Remove Row
                    </Button>
                </div>
            )
        });

        return (
            <React.Fragment>
                {addon.add && <span>{addon.add}</span>}
                {finalOutput}
                <Button onClick={() => this.addRow(addon.model)} style={{ width: "100%" }}>Add {addon.name}<PlusOutlined /></Button>
            </React.Fragment>
        )
    }




    onChange = (e) => {
        this.setState({ data: { ...this.state.data, [e.target.name]: e.target.value } });
    };

    onChangeNumber = (value, key) => {
        this.setState({ data: { ...this.state.data, [key]: value } })
    }

    onChangeFile = (e) => {
        this.setState({ data: { ...this.state.data, [e.target.name]: e.target.files[0] } });
    };

    onChangeSelect = (value, key) => {
        this.setState({ data: { ...this.state.data, [key]: value } })
    }

    onChangeM2M = (value, key) => {
        this.setState({ data: { ...this.state.data, [key]: value } });
    }

    onChangeDateTime = (value, dateString, name) => {
        this.setState({ data: { ...this.state.data, [name]: dateString } });
    }

    onChangeRange = (values, dateStrings, start_key, end_key) => {
        this.setState({ data: { ...this.state.data, [start_key]: dateStrings[0] + '-01', [end_key]: dateStrings[1] + '-01' } })
    }

    onChangePhone = (value, key) => {
        this.setState({ data: { ...this.state.data, [key]: '+' + value } });
    }

    onChangeSplit = (value, key, position, delimiter, total) => {
        let data;
        if (this.state.data[key]) {
            data = this.state.data[key].split(delimiter);
            data[position] = value;
            data = data.join(delimiter);
        }
        else {
            for (let i = 0; i < total; i++) {
                data += i === total - 1 ? '!' : '!' + delimiter
            }
        }

        this.setState({ data: { ...this.state.data, [key]: data } });
    }

    validate = () => {
        let model = this.props.model;
        let formValidation = model.map((m) => {
            let key = m.key;
            let blank = m.blank || false;
            let validation = '';

            if (!blank) {
                validation = (this.state.data[key] === null || this.state.data[key] === '') ? 'Field cannot be blank!' : ''
            }

            let error = (validation !== "") ? true : false

            validation !== this.state.error[key] && this.setState({ error: { ...this.state.error, [key]: validation } })
            return error
        });
        return formValidation;
    }

    onFinish = (e) => {
        let submit = true;
        this.validate().map(error => {
            if (error) {
                submit = false;
                return submit
            }
        })
        if (submit) {
            this.props.onSubmit(this.state.data)
        }
    }


    render() {
        return (
            this.state.data ?
                <div className='dynamic-form'>
                    <Form {...layout} name="dynamic_form_item" onFinish={(e) => (this.onFinish(e))}>
                        {this.renderForm()}
                        {this.props.addon.map(addon => this.renderAddOn(addon))}
                        <br />
                        <Button type="primary submit" htmlType="submit">
                            {this.props.submitButton ? <span>{this.props.submitButton}</span>
                                : <span>Submit</span>}
                        </Button>
                    </Form >
                </div > : null
        )
    }
}

export default DynamicForm