import { Row, Col, Space } from "antd";
import { message } from "antd";
import { Table, Descriptions } from "antd";
import { Form, InputNumber, Button, Select } from "antd";
import { Tooltip, Tag, Popover, Popconfirm } from "antd";
import {
  EditOutlined,
  MailOutlined,
  DeleteOutlined,
  CheckOutlined,
  SwapOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

import axios from "axios";

import { ProjectItem, UserItem } from "./interfaces";

const ProjectTable = (props: {
  type: "current" | "history";
  data: Array<ProjectItem>;
  user: Array<UserItem>;
  onChange: () => void;
}) => {
 
  // 时间戳格式化
  const formatTimestamp = (unix_timestamp: number) => {
    const d = new Date(unix_timestamp * 1000);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(
      2,
      "0"
    )}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const handleEditPage = async (id: string, page: number) => {
    axios.post(
      "/api2/current/edit",
      { id: id, page: page }
    ).then((response) => {
      if (response.data.result) {
        message.error(`修改失败(${response.data.err})`);
      }
      else {
        message.success("修改成功");
        props.onChange();
      }
    }).catch(function (error) {
      message.error(`修改失败(${error.message})`);
    })
  };

  const handleSendMail = async (id: number | string, user: string) => {
    axios.post(
      typeof id === "string" ? "/api/current/resend" : "/api/history/resend",
      { id: id, to: user }
    ).then((response) => {
      if (response.data.result) {
        message.error(`邮件发送失败(${response.data.err})`);
      }
      else {
        message.success("已加入发送队列");
      }
    }).catch(function (error) {
      message.error(`邮件发送失败(${error.message})`);
    });
  };

  const handleEditUrgent = async (id: string, urgent: number) => {
    axios.post(
      "/api2/current/edit",
      { id: id, urgent: !urgent }
    ).then((response) => {
      if (response.data.result) {
        message.error(`修改失败(${response.data.err})`);
      }
      else {
        message.success("修改成功");
        props.onChange();
      }
    }).catch(function (error) {
      message.error(`修改失败(${error.message})`);
    });
  };

  const handleEditReviewer = async (id: string, user: string) => {
    axios.post(
      "/api2/current/edit",
      { id: id, reviewerID: user }
    ).then((response) => {
      if (response.data.result) {
        message.error(`修改失败(${response.data.err})`);
      }
      else {
        message.success("修改成功");
        axios.post(
          "/api/current/resend",
          { id: id, to: user }
        ).then((response) => {
          if (response.data.result) {
            message.error(`邮件发送失败(${response.data.err})`);
          } else {
            message.success("邮件发送成功");
          }
        }).catch(function (error) {
          message.error(`邮件发送失败(${error.message})`);
        });
      }
    }).catch(function (error) {
      message.error(`修改失败(${error.message})`);
    });
  };

  const handleDeleteProject = async (id: string) => {
    axios.post(
      "/api2/current/delete",
      { id: id }
    ).then((response) => {
      if (response.data.result) {
        message.error(`删除失败(${response.data.err})`);
      }
      else {
        message.success("删除成功");
      }
    }).catch(function (error) {
      message.error(`删除失败(${error.message})`);
    });
  };

  return (
    <Table
      dataSource={props.data}
      rowKey="id"
      pagination={{ position: ["bottomCenter"], hideOnSinglePage: true }}
      expandable={{
        expandedRowRender: (record) => (
          <Row gutter={[80, 8]}>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Descriptions column={1} labelStyle={{ margin: "auto" }}>
                <Descriptions.Item label="项目名称" span={2}>
                  <Space direction="vertical">
                    {Object.entries(record.names).map(([code, name]) => (
                      <div>
                        <Tag color="default">{code}</Tag>
                        {name}
                      </div>
                    ))}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="委托单位" span={2}>
                  {record.company}
                </Descriptions.Item>
              </Descriptions>
              <Descriptions column={{ lg: 2, md: 2, sm: 2, xs: 1 }}>
                <Descriptions.Item label="报告页数">
                  <Space>
                    {record.page}
                    {props.type === "current" ? (
                      <Popover
                        title="修改页数"
                        trigger="click"
                        placement="right"
                        content={
                          <Form
                            layout="inline"
                            onFinish={(values: any) => handleEditPage(record.id as string, values.page)}>
                            <Form.Item initialValue={record.page} name="page">
                              <InputNumber size="small"/>
                            </Form.Item>
                            <Form.Item>
                              <Button type="primary" size="small" htmlType="submit" icon={<CheckOutlined />} />
                            </Form.Item>
                          </Form>}>
                        <Button icon={<EditOutlined />} size="small" />
                      </Popover>
                    ) : undefined}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="加急审核">
                  <Space>
                    {record.urgent ? "是" : "否"}
                    {props.type === "current" ? (
                      <Popconfirm
                        title={`修改为${record.urgent ? "非" : ""}加急？`}
                        onConfirm={() => handleEditUrgent(record.id as string, record.urgent)}
                      >
                        <Button icon={<EditOutlined />} size="small" />
                      </Popconfirm>
                    ) : undefined}
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Descriptions column={1}>
                <Descriptions.Item label="提交审核">
                  <Space>
                    {record.author_name}
                    <Tooltip
                      title={formatTimestamp(record.start)}
                      placement="right"
                    >
                      <ClockCircleOutlined />
                    </Tooltip>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="完成审核">
                  <Space>
                    {record.reviewer_name}
                    <Tooltip
                      title={record.end ? formatTimestamp(record.end) : "（审核中）"}
                      placement="right"
                    >
                      <ClockCircleOutlined />
                    </Tooltip>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="项目操作">
                  {props.type === "current" ?
                    (<Space wrap>
                      <Popconfirm
                        title={`重发[报告分配审核]至${record.reviewer_name}？`}
                        okText="确认"
                        cancelText="取消"
                        onConfirm={() => handleSendMail(record.id, record.reviewer_id)}>
                        <Button icon={<MailOutlined />} size="small">重发邮件</Button>
                      </Popconfirm>
                      <Popover
                        trigger="click"
                        title="选择移交对象"
                        content={
                          <Form
                            layout="inline"
                            onFinish={(values: any) => handleEditReviewer(record.id as string, values.user)}>
                            <Form.Item name="user" rules={[{ required: true, message: "请选择用户" }]}>
                              <Select placeholder="请选择用户" style={{ width: "160px" }}>
                                {props.user.map((u) => (<Select.Option key={u.id}>{u.name}</Select.Option>))}
                              </Select>
                            </Form.Item>
                            <Form.Item>
                              <Button type="primary" htmlType="submit" icon={<CheckOutlined />} />
                            </Form.Item>
                          </Form>
                        }
                      >
                        <Button icon={<SwapOutlined />} size="small">移交审核</Button>
                      </Popover>
                      <Popconfirm
                        title={`删除项目？`}
                        okText="确认"
                        cancelText="取消"
                        onConfirm={() => handleDeleteProject(record.id as string)}>
                        <Button icon={<DeleteOutlined />} size="small">删除项目</Button>
                      </Popconfirm>
                    </Space>) :
                    (<Space wrap>
                      <Popconfirm
                        title={`重发[报告完成审核]至${record.author_name}？`}
                        okText="确认"
                        cancelText="取消"
                        onConfirm={() => handleSendMail(record.id, record.author_id)}>
                        <Button icon={<MailOutlined />} size="small">重发邮件</Button>
                      </Popconfirm>
                      <Popover
                        title="选择发送对象"
                        trigger="click"
                        content={
                          <Form
                            layout="inline"
                            onFinish={(values: any) => handleSendMail(record.id, values.user)}>
                            <Form.Item name="user" rules={[{ required: true, message: "请选择用户" }]}>
                              <Select placeholder="请选择用户" style={{ width: "160px" }}>
                                {props.user.map((u) => (<Select.Option key={u.id}>{u.name}</Select.Option>))}
                              </Select>
                            </Form.Item>
                            <Form.Item>
                              <Button htmlType="submit" icon={<CheckOutlined />} />
                            </Form.Item>
                          </Form>
                        }
                      >
                        <Button icon={<MailOutlined />} size="small">获取报告</Button>
                      </Popover>
                    </Space>)}
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row >
        ),
        expandRowByClick: true,
      }}
    >
      <Table.Column
        title="项目名称"
        dataIndex="names"
        ellipsis
        render={(names: Map<string, string>) =>
          Array.from(new Set(Object.values(names))).join("、")}
      />
      <Table.Column
        title="委托单位"
        dataIndex="company"
        ellipsis
        responsive={["sm"]}
      />
      <Table.Column
        title="撰写人"
        dataIndex="author_name"
        width="15%"
        responsive={["md"]}
      />
      <Table.Column
        title="审核人"
        dataIndex="reviewer_name"
        width="15%"
        responsive={["lg"]}
      />
    </Table>
  );
};

export { ProjectTable };
