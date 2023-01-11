import { useState } from "react";
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

  // 目前仅type="current"的项目可修改或删除，因此限定id为string类型
  // 所有项目均可发送邮件，因此id为string类型(current)或number类型(history)
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

  const handleEditUrgent = async (id: string, urgent: boolean) => {
    axios.post(
      "/api2/current/edit",
      { id: id, urgent: urgent }
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

  return (
    <Table
      dataSource={props.data}
      rowKey="id"
      pagination={{ position: ["bottomCenter"], hideOnSinglePage: true }}
      expandable={{
        expandedRowRender: (record) => (
          <ProjectDescription
            type={props.type}
            record={record}
            user={props.user}
            onEditPage={handleEditPage}
            onEditUrgent={handleEditUrgent}
            onEditReviewer={handleEditReviewer}
            onDeleteProject={handleDeleteProject}
            onSendMail={handleSendMail}
          />
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

const ProjectDescription = (props: {
  type: "current" | "history";
  record: ProjectItem;
  user: Array<UserItem>;
  onEditPage: (id: string, page: number) => void;
  onEditUrgent: (id: string, urgent: boolean) => void;
  onEditReviewer: (id: string, user: string) => void;
  onDeleteProject: (id: string) => void;
  onSendMail: (id: number | string, user: string) => void;
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

  // 自管state处理函数
  const [editPageOpen, setEditPageOpen] = useState<boolean>(false);
  const [editPageConfirmLoading, setEditPageConfirmLoading] = useState<boolean>(false);
  const [editUrgentConfirmLoading, setEditUrgentConfirmLoading] = useState<boolean>(false);
  const [editReviewerOpen, setEditReviewerOpen] = useState<boolean>(false);
  const [editReviewerConfirmLoading, setEditReviewerConfirmLoading] = useState<boolean>(false);
  const [deleteProjectConfirmLoading, setDeleteProjectConfirmLoading] = useState<boolean>(false);
  const [resendMailConfirmLoading, setResendMailConfirmLoading] = useState<boolean>(false);
  const [sendMailOpen, setSendMailOpen] = useState<boolean>(false);
  const [sendMailConfirmLoading, setSendMailConfirmLoading] = useState<boolean>(false);

  const handleEditPage = async (id: string, page: number) => {
    setEditPageConfirmLoading(true);
    props.onEditPage(id, page);
    setEditPageConfirmLoading(false);
    setEditPageOpen(false);
  };

  const handleEditUrgent = async (id: string, urgent: boolean) => {
    setEditUrgentConfirmLoading(true);
    props.onEditUrgent(id, urgent);
    setEditUrgentConfirmLoading(false);
  };

  const handleEditReviewer = async (id: string, user: string) => {
    setEditReviewerConfirmLoading(true);
    props.onEditReviewer(id, user);
    setEditReviewerConfirmLoading(false);
    setEditReviewerOpen(false);
  };

  const handleDeleteProject = async (id: string) => {
    setDeleteProjectConfirmLoading(true);
    props.onDeleteProject(id);
    setDeleteProjectConfirmLoading(false);
  };

  const handleResendMail = async (id: number | string, user: string) => {
    setResendMailConfirmLoading(true);
    props.onSendMail(id, user);
    setResendMailConfirmLoading(false);
  };

  const handleSendMail = async (id: number, user: string) => {
    setSendMailConfirmLoading(true);
    props.onSendMail(id, user);
    setSendMailConfirmLoading(false);
    setSendMailOpen(false);
  };

  return (
    <Row gutter={[80, 8]}>
      <Col xs={24} sm={24} md={12} lg={12} xl={12}>
        <Descriptions column={1} labelStyle={{ margin: "auto" }}>
          <Descriptions.Item label="项目名称" span={2}>
            <Space direction="vertical">
              {Object.entries(props.record.names).map(([code, name]) => (
                <div>
                  <Tag color="default">{code}</Tag>
                  {name}
                </div>
              ))}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="委托单位" span={2}>
            {props.record.company}
          </Descriptions.Item>
        </Descriptions>
        <Descriptions column={{ lg: 2, md: 2, sm: 2, xs: 1 }}>
          <Descriptions.Item label="报告页数">
            <Space>
              {props.record.page}
              {props.type === "current" ? (
                <Popover
                  title="修改页数"
                  trigger="click"
                  open={editPageOpen}
                  onOpenChange={(open) => setEditPageOpen(open)}
                  placement="right"
                  content={
                    <Form
                      layout="inline"
                      onFinish={(values: any) => handleEditPage(props.record.id as string, values.page)}>
                      <Form.Item initialValue={props.record.page} name="page">
                        <InputNumber />
                      </Form.Item>
                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          icon={<CheckOutlined />}
                          loading={editPageConfirmLoading}
                        />
                      </Form.Item>
                    </Form>}>
                  <Button icon={<EditOutlined />} size="small" />
                </Popover>
              ) : undefined}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="加急审核">
            <Space>
              {props.record.urgent ? "是" : "否"}
              {props.type === "current" ? (
                <Popconfirm
                  title={`修改为${props.record.urgent ? "非" : ""}加急？`}
                  okButtonProps={{ loading: editUrgentConfirmLoading }}
                  onConfirm={() => handleEditUrgent(props.record.id as string, !props.record.urgent)}
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
              {props.record.author_name}
              <Tooltip
                title={formatTimestamp(props.record.start)}
                placement="right"
              >
                <ClockCircleOutlined />
              </Tooltip>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label={props.type === "current" ? "审核中" : "完成审核"}>
            <Space>
              {props.record.reviewer_name}
              {props.type === "current" ? undefined :
                (<Tooltip
                  title={formatTimestamp(props.record.end)}
                  placement="right"
                >
                  <ClockCircleOutlined />
                </Tooltip>)}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="项目操作">
            {props.type === "current" ?
              (<Space wrap>
                <Popconfirm
                  title={`重发[报告分配审核]至${props.record.reviewer_name}？`}
                  okText="确认"
                  cancelText="取消"
                  okButtonProps={{ loading: resendMailConfirmLoading }}
                  onConfirm={() => handleResendMail(props.record.id, props.record.reviewer_id)}>
                  <Button icon={<MailOutlined />} size="small">重发邮件</Button>
                </Popconfirm>
                <Popover
                  title="选择移交对象"
                  trigger="click"
                  open={editReviewerOpen}
                  onOpenChange={(open) => setEditReviewerOpen(open)}
                  content={
                    <Form
                      layout="inline"
                      onFinish={(values: any) => handleEditReviewer(props.record.id as string, values.user)}>
                      <Form.Item name="user" rules={[{ required: true, message: "请选择用户" }]}>
                        <Select placeholder="请选择用户" style={{ width: "160px" }}>
                          {props.user.map((u) => (<Select.Option key={u.id}>{u.name}</Select.Option>))}
                        </Select>
                      </Form.Item>
                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={editReviewerConfirmLoading}
                          icon={<CheckOutlined />}
                        />
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
                  okButtonProps={{ loading: deleteProjectConfirmLoading }}
                  onConfirm={() => handleDeleteProject(props.record.id as string)}>
                  <Button icon={<DeleteOutlined />} size="small">删除项目</Button>
                </Popconfirm>
              </Space>) :
              (<Space wrap>
                <Popconfirm
                  title={`重发[报告完成审核]至${props.record.author_name}？`}
                  okText="确认"
                  cancelText="取消"
                  okButtonProps={{ loading: resendMailConfirmLoading }}
                  onConfirm={() => handleResendMail(props.record.id, props.record.author_id)}>
                  <Button icon={<MailOutlined />} size="small">重发邮件</Button>
                </Popconfirm>
                <Popover
                  title="选择发送对象"
                  trigger="click"
                  open={sendMailOpen}
                  onOpenChange={(open) => setSendMailOpen(open)}
                  content={
                    <Form
                      layout="inline"
                      onFinish={(values: any) => handleSendMail(props.record.id as number, values.user)}>
                      <Form.Item name="user" rules={[{ required: true, message: "请选择用户" }]}>
                        <Select placeholder="请选择用户" style={{ width: "160px" }}>
                          {props.user.map((u) => (<Select.Option key={u.id}>{u.name}</Select.Option>))}
                        </Select>
                      </Form.Item>
                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={sendMailConfirmLoading}
                          icon={<CheckOutlined />}
                        />
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
  )
}


export { ProjectTable };
