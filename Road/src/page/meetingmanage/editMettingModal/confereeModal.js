import React, { Component } from 'react';
import { Form, Input, Button, Radio, Upload, Icon, Col, Row, message, Transfer } from 'antd';
import conferee from './confereeModal'
import $ from 'jquery';
import MUtil from 'util/mm.jsx';
const _mm = new MUtil();
const FormItem = Form.Item;
const { TextArea } = Input;
// import {   Col } from 'antd';
let mockData = [];

let oriTargetKeys = [];
let optionalConfereeList = [];
let selectedConfereeList = [];
let allOptionConferee = [];
class SeoCreateFormComP extends Component {
    state = {
        mockData: [],
        targetKeys: oriTargetKeys,
        selectedKeys: [],
        disabled: false,
        selectedConfereeList: [],
        optionalConfereeList: []
    }
    componentDidMount() {
        this.getoptionalConfereeList();
        this.getselectedConfereeList();
    }
    componentWillReceiveProps() {
        this.getoptionalConfereeList();
    }
    //获取候选参会人员信息
    getoptionalConfereeList = () => {
        var myThis = this
        $.ajax({
            url: "/conferee/queryOptionalConferee",
            type: "post",
            // async: false,
            data: {
                conferenceId: window.selectValue.conferenceId,
                // conferenceId:conferenceId,
                //   conferenceId: 1,
                userId: _mm.getStorage('userInfo').userId,

                token: _mm.getStorage('userInfo').token,
            },
            success: function (res) {

                // data = res;
                if (res.result === 0) {
                    optionalConfereeList = [];
                    myThis.setState({ optionalConfereeList });
                    myThis.getselectedConfereeList();
                }
                else if (res.result === 1) {
                    optionalConfereeList = res.optionalConfereeList;
                    myThis.setState({ optionalConfereeList });
                    myThis.getselectedConfereeList();
                } else {
                    message.error(res.message)
                }

            },
            error: function () {
                alert("失败");
            }
        }
        )
    }
    //获取已选参会人员信息
    getselectedConfereeList = () => {
        var myThis = this
        $.ajax({
            url: "/conferee/querySelectedConferee",
            type: "post",
            // async: false,
            data: {
                conferenceId: window.selectValue.conferenceId,
                // conferenceId: 1,
                userId: _mm.getStorage('userInfo').userId,
                token: _mm.getStorage('userInfo').token,
            },
            success: function (res) {
                // data = res;
                if (res.result === 0) {
                    selectedConfereeList = [];
                    myThis.setState({ selectedConfereeList });
                    myThis.eidtforMockData();
                }else if(res.result===1){
                    selectedConfereeList = res.selectedConfereeList;
                    myThis.setState({ selectedConfereeList });
                    myThis.eidtforMockData();
                }
                console.log(selectedConfereeList);
            },
            error: function () {
                alert("失败");
            }
        }
        )
    }
    //修改参会人员显示
    eidtforMockData = () => {
        mockData = [];
        oriTargetKeys = [];
        for (let i = 0; i < optionalConfereeList.length; i++) {
            mockData.push({
                key: optionalConfereeList[i].userId,
                title: `${optionalConfereeList[i].company} ${optionalConfereeList[i].duty} ${optionalConfereeList[i].userName}`,
                description: 'description of content${i + 1}'
            })
        }
        for (let i = 0; i < selectedConfereeList.length; i++) {
            mockData.push({
                key: selectedConfereeList[i].userId,
                title: `${selectedConfereeList[i].company} ${selectedConfereeList[i].duty} ${selectedConfereeList[i].userName}`,
                description: `description of content${i + 1}`,
                /* disabled: i % 3 < 1, */
            });
            oriTargetKeys.push(
                selectedConfereeList[i].userId
            )
        }
        console.log(oriTargetKeys);
        allOptionConferee = [];
        allOptionConferee = allOptionConferee.concat(optionalConfereeList);
        allOptionConferee = allOptionConferee.concat(selectedConfereeList);
        console.log("111", allOptionConferee);
        this.setState({
            mockData,
            targetKeys: oriTargetKeys
        });
    }
    //把人员从可选列表发送到已选列表
    sendOptionalConferee = (userId, sendUserId, conferenceId, nextTargetKeys) => {
        var myThis = this;
        console.log(sendUserId, userId, conferenceId, nextTargetKeys);
        $.ajax({
            url: "/conferee/sendOptionalConferee ",
            type: "post",
            // async: false,
            data: {
                userId: userId,
                sendUserId: sendUserId,
                // conferenceId: conferenceId,
                conferenceId: window.selectValue.conferenceId,
                //  conferenceId: 1,
                // conferenceId:myThis.props.conferenceId,
                // userId:_mm.getStorage('userInfo').userId,
                token: _mm.getStorage('userInfo').token,
            },
            success: function (res) {

                if (res.result === -1) {
                    alert(res.message);
                }
                else {
                    myThis.setState({ targetKeys: nextTargetKeys });
                    // alert("成功");
                };

                // data = res;
                console.log(res);
            },
            error: function () {
                alert("失败");
            }
        }
        )
    }
    //移除已选框中的参会人员 
    removeSelectedConferee = (removeUserId, nextTargetKeys) => {
        var myThis = this
        $.ajax({
            url: "/conferee/removeSelectedConferee ",
            type: "post",
            // async: false,
            data: {
                removeUserId: removeUserId,
                conferenceId: window.selectValue.conferenceId,
                userId: _mm.getStorage('userInfo').userId,
                token: _mm.getStorage('userInfo').token,
            },
            success: function (res) {
                // alert("成功");
                // data = res;
                console.log(res);
                myThis.setState({ targetKeys: nextTargetKeys });
            },
            error: function () {
                alert("失败");
            }
        }
        )
    }
    handleChange = (nextTargetKeys, direction, moveKeys) => {

        console.log('targetKeys: ', nextTargetKeys);
        console.log('direction: ', direction);
        console.log('moveKeys: ', moveKeys);

        if (direction === "left") {//左移，删除参会人员
            for (let i = 0; i < moveKeys.length; i++) {
                this.removeSelectedConferee(moveKeys[i], nextTargetKeys);
            }
        } else if (direction === "right") {//右移，增加参会人员
            for (let i = 0; i < moveKeys.length; i++) {
                for (let j = 0; j < allOptionConferee.length; j++) {
                    if (allOptionConferee[j].userId === moveKeys[i]) {
                        console.log("allOptionConferee[j]", allOptionConferee[j].conferenceId, moveKeys[i], nextTargetKeys);
                        this.sendOptionalConferee(_mm.getStorage('userInfo').userId, moveKeys[i], allOptionConferee[j].conferenceId, nextTargetKeys);
                    }
                }
            }
        } else {
            alert("出错了");
        }
    }


    handleSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
        this.setState({ selectedKeys: [...sourceSelectedKeys, ...targetSelectedKeys] });
        console.log('sourceSelectedKeys: ', sourceSelectedKeys);
        console.log('targetSelectedKeys: ', targetSelectedKeys);
    }

    handleScroll = (direction, e) => {
        console.log('direction:', direction);
        console.log('target:', e.target);
    }

    handleDisable = (disabled) => {
        this.setState({ disabled });
    };
    render() {
        const { mockData, targetKeys, selectedKeys, disabled } = this.state;
        console.log(targetKeys);
        console.log(selectedKeys);
        const { form } = this.props;
        const { getFieldDecorator } = form;
        const { save } = form;
        const saveFormData = () => {
            form.validateFields((err, values) => {
                if (err) {
                    return;
                }
                console.table(values);
                values.userId = _mm.getStorage('userInfo').userId;
                values.token = _mm.getStorage('userInfo').token;
                // 在这里执行保存到服务器的操作使用axios
                $.ajax({
                    url: "/conference/updateConference",
                    type: "post",
                    // async: false,
                    data: values,
                    success: function (res) {
                        // alert("成功");
                        // data = res;
                        console.log(res);
                    },
                    error: function () {
                        alert("失败");
                    }
                })
                // 在这里执行保存到服务器的操作使用axios
                message.success('保存成功！')
            });


        }
        const nextStep = () => {
            console.log('nextStep');
            this.props.handelNextStep("5");
        }
        const LastStep = () => {
            console.log('nextStep');
            this.props.handelNextStep("3");
        }
        return (
            <Form layout='vertical'>
                <row>
                    <Transfer
                        listStyle={{
                            margin: '0 auto',
                            width: 600,
                            height: 600,
                        }}
                        dataSource={mockData}
                        titles={['候选参会人员', '参会人员']}
                        targetKeys={targetKeys}
                        selectedKeys={selectedKeys}
                        onChange={this.handleChange}
                        onSelectChange={this.handleSelectChange}
                        onScroll={this.handleScroll}
                        render={item => item.title}
                        disabled={disabled}
                        operations={['添加至参会人员', '至候选参会人列表']}
                    />
                    <Col span={24} style={{ textAlign: 'right' }}>
                        <Button type="primary" onClick={LastStep}>上一步</Button> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <Button type="primary" onClick={nextStep}>下一步</Button> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <Button type="primary" onClick={saveFormData}>保存</Button>
                    </Col>
                </row>
            </Form>
        )
    }
}

const SeoCreateForm = Form.create()(
    SeoCreateFormComP
)

class Conferee extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div>
                <SeoCreateForm handelNextStep={this.props.handelNextStep.bind(this)} />
            </div>
        )
    }
}


export default Conferee;

