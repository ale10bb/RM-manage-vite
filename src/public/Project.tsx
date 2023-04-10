import { useState, useEffect } from "react";
import jwt_decode from "jwt-decode";

import { Button, Typography } from "antd";
const { Text } = Typography;
import { Space } from "antd";
import { Form, InputNumber, Select } from "antd";
import { message } from "antd";
import { Badge, Collapse, Descriptions, List, Popover, Table, Tag } from "antd";
import { Popconfirm } from "antd";
import {
  EditOutlined,
  MailOutlined,
  DeleteOutlined,
  CheckOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { TablePaginationConfig } from "antd/es/table";

import axios from "./axios-config";
import { ProjectItem, UserItem, MyToken } from "./interfaces";

const ProjectList = (props: {
  type: "current" | "history";
  data: { project: Array<ProjectItem>; total: number };
  pagination: { current: number | undefined; pageSize: number | undefined };
  onPageChange?: (
    current: number | undefined,
    pageSize: number | undefined
  ) => void | undefined;
  onDataChange?: () => void | undefined;
}) => {
  const token = sessionStorage.getItem("token");
  const user_id = token ? jwt_decode<MyToken>(token).sub : "";
  // 用户列表（用于选择邮件发送对象）
  const [userData, setUserData] = useState<Array<UserItem>>([]);
  useEffect(() => {
    const fetchUser = async () => {
      axios
        .post("/api/user/list", {
          isReviewer: props.type === "current" ? true : false,
        })
        .then((response) => {
          if (response.data.result) {
            message.error(`获取失败(${response.data.err})`);
          } else {
            setUserData(response.data.data.user);
          }
        })
        .catch(function (error) {
          message.error(`获取失败(${error.message})`);
        });
    };
    fetchUser();
  }, []);

  // 目前仅type="current"的项目可修改或删除，因此限定id为string类型
  // 所有项目均可发送邮件，因此id为string类型(current)或number类型(history)
  const handleEditPage = async (id: string, page: number) => {
    try {
      const response = await axios.post("/api/current/edit", {
        id: id,
        page: page,
      });
      if (response.data.result) {
        message.error(`修改失败(${response.data.err})`);
      } else {
        message.success("修改成功");
        props.onDataChange ? props.onDataChange() : undefined;
      }
    } catch (error: any) {
      message.error(`修改失败(${error.message})`);
    }
  };

  const handleEditUrgent = async (id: string, urgent: boolean) => {
    try {
      const response = await axios.post("/api/current/edit", {
        id: id,
        urgent: urgent,
      });
      if (response.data.result) {
        message.error(`修改失败(${response.data.err})`);
      } else {
        message.success("修改成功");
        props.onDataChange ? props.onDataChange() : undefined;
      }
    } catch (error: any) {
      message.error(`修改失败(${error.message})`);
    }
  };

  const handleEditReviewer = async (id: string, user: string) => {
    try {
      const response = await axios.post("/api/current/edit", {
        id: id,
        reviewerID: user,
      });
      if (response.data.result) {
        message.error(`修改失败(${response.data.err})`);
      } else {
        message.success("修改成功");
        props.onDataChange ? props.onDataChange() : undefined;
        try {
          const response = await axios.post("/api/current/resend", {
            id: id,
            to: user,
          });
          if (response.data.result) {
            message.error(`邮件发送失败(${response.data.err})`);
          } else {
            message.success(`发送邮件中 (${response.data.data.entryid})`);
          }
        } catch (error: any) {
          message.error(`邮件发送失败(${error.message})`);
        }
      }
    } catch (error: any) {
      message.error(`修改失败(${error.message})`);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const response = await axios.post("/api/current/delete", { id: id });
      if (response.data.result) {
        message.error(`删除失败(${response.data.err})`);
      } else {
        message.success("删除成功");
        props.onDataChange ? props.onDataChange() : undefined;
      }
    } catch (error: any) {
      message.error(`删除失败(${error.message})`);
    }
  };

  const handleSendMail = async (id: number | string, user: string) => {
    try {
      const response = await axios.post(
        typeof id === "string" ? "/api/current/resend" : "/api/history/resend",
        { id: id, to: user }
      );
      if (response.data.result) {
        message.error(`邮件发送失败(${response.data.err})`);
      } else {
        message.success(`发送邮件中 (${response.data.data.entryid})`);
        props.onDataChange ? props.onDataChange() : undefined;
      }
    } catch (error: any) {
      message.error(`邮件发送失败(${error.message})`);
    }
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    props.onPageChange
      ? props.onPageChange(pagination.current, pagination.pageSize)
      : undefined;
  };

  return (
    <List
      dataSource={props.data.project}
      renderItem={(item) => (
        <List.Item key={item.id}>
          <List.Item.Meta
            title={Array.from(new Set(Object.values(item.names))).join("、")}
            description={
              <Space>
                {item.authorid === user_id
                  ? "已提交审核"
                  : `撰写人：${item.authorname}`}
                {"|"}
                <Badge
                  status="processing"
                  text={`审核中${
                    item.reviewerid === user_id ? "" : `：${item.reviewername}`
                  }`}
                />
              </Space>
            }
          />
          <Collapse ghost expandIconPosition="start">
            <Collapse.Panel header={<a>详情</a>} key={item.id}>
              <ProjectDescription
                type={props.type}
                record={item}
                users={userData}
                onEditPage={handleEditPage}
                onEditUrgent={handleEditUrgent}
                onEditReviewer={handleEditReviewer}
                onDeleteProject={handleDeleteProject}
                onSendMail={handleSendMail}
              />
            </Collapse.Panel>
          </Collapse>
        </List.Item>
      )}
    />
  );
};

const ProjectTable = (props: {
  type: "current" | "history";
  data: { project: Array<ProjectItem>; total: number };
  pagination: { current: number | undefined; pageSize: number | undefined };
  onPageChange?: (
    current: number | undefined,
    pageSize: number | undefined
  ) => void | undefined;
  onDataChange?: () => void | undefined;
}) => {
  // 用户列表（用于选择邮件发送对象）
  const [userData, setUserData] = useState<Array<UserItem>>([]);
  useEffect(() => {
    const fetchUser = async () => {
      axios
        .post("/api/user/list", {
          isReviewer: props.type === "current" ? true : false,
        })
        .then((response) => {
          if (response.data.result) {
            message.error(`获取失败(${response.data.err})`);
          } else {
            setUserData(response.data.data.user);
          }
        })
        .catch(function (error) {
          message.error(`获取失败(${error.message})`);
        });
    };
    fetchUser();
  }, []);

  // 目前仅type="current"的项目可修改或删除，因此限定id为string类型
  // 所有项目均可发送邮件，因此id为string类型(current)或number类型(history)
  const handleEditPage = async (id: string, page: number) => {
    try {
      const response = await axios.post("/api/current/edit", {
        id: id,
        page: page,
      });
      if (response.data.result) {
        message.error(`修改失败(${response.data.err})`);
      } else {
        message.success("修改成功");
        props.onDataChange ? props.onDataChange() : undefined;
      }
    } catch (error: any) {
      message.error(`修改失败(${error.message})`);
    }
  };

  const handleEditUrgent = async (id: string, urgent: boolean) => {
    try {
      const response = await axios.post("/api/current/edit", {
        id: id,
        urgent: urgent,
      });
      if (response.data.result) {
        message.error(`修改失败(${response.data.err})`);
      } else {
        message.success("修改成功");
        props.onDataChange ? props.onDataChange() : undefined;
      }
    } catch (error: any) {
      message.error(`修改失败(${error.message})`);
    }
  };

  const handleEditReviewer = async (id: string, user: string) => {
    try {
      const response = await axios.post("/api/current/edit", {
        id: id,
        reviewerID: user,
      });
      if (response.data.result) {
        message.error(`修改失败(${response.data.err})`);
      } else {
        message.success("修改成功");
        props.onDataChange ? props.onDataChange() : undefined;
        try {
          const response = await axios.post("/api/current/resend", {
            id: id,
            to: user,
          });
          if (response.data.result) {
            message.error(`邮件发送失败(${response.data.err})`);
          } else {
            message.success(`发送邮件中 (${response.data.data.entryid})`);
          }
        } catch (error: any) {
          message.error(`邮件发送失败(${error.message})`);
        }
      }
    } catch (error: any) {
      message.error(`修改失败(${error.message})`);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const response = await axios.post("/api/current/delete", { id: id });
      if (response.data.result) {
        message.error(`删除失败(${response.data.err})`);
      } else {
        message.success("删除成功");
        props.onDataChange ? props.onDataChange() : undefined;
      }
    } catch (error: any) {
      message.error(`删除失败(${error.message})`);
    }
  };

  const handleSendMail = async (id: number | string, user: string) => {
    try {
      const response = await axios.post(
        typeof id === "string" ? "/api/current/resend" : "/api/history/resend",
        { id: id, to: user }
      );
      if (response.data.result) {
        message.error(`邮件发送失败(${response.data.err})`);
      } else {
        message.success(`发送邮件中 (${response.data.data.entryid})`);
        props.onDataChange ? props.onDataChange() : undefined;
      }
    } catch (error: any) {
      message.error(`邮件发送失败(${error.message})`);
    }
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    props.onPageChange
      ? props.onPageChange(pagination.current, pagination.pageSize)
      : undefined;
  };

  return (
    <Table
      dataSource={props.data.project}
      rowKey="id"
      pagination={{
        responsive: true,
        hideOnSinglePage: true,
        total: props.data.total,
        ...props.pagination,
      }}
      expandable={{
        expandedRowRender: (record) => (
          <ProjectDescription
            type={props.type}
            record={record}
            users={userData}
            onEditPage={handleEditPage}
            onEditUrgent={handleEditUrgent}
            onEditReviewer={handleEditReviewer}
            onDeleteProject={handleDeleteProject}
            onSendMail={handleSendMail}
          />
        ),
        expandRowByClick: true,
      }}
      scroll={{ scrollToFirstRowOnChange: true }}
      onChange={handleTableChange}
    >
      <Table.Column
        title="项目名称"
        dataIndex="names"
        ellipsis
        render={(names: Map<string, string>) =>
          Array.from(new Set(Object.values(names))).join("、")
        }
      />
      <Table.Column
        title="委托单位"
        dataIndex="company"
        ellipsis
        responsive={["md"]}
      />
      <Table.Column
        title="撰写人"
        dataIndex="authorname"
        width="15%"
        responsive={["lg"]}
      />
      <Table.Column
        title="审核人"
        dataIndex="reviewername"
        width="15%"
        responsive={["lg"]}
      />
    </Table>
  );
};

const ProjectDescription = (props: {
  type: "current" | "history";
  record: ProjectItem;
  users: Array<UserItem>;
  onEditPage: (id: string, page: number) => void;
  onEditUrgent: (id: string, urgent: boolean) => void;
  onEditReviewer: (id: string, user: string) => void;
  onDeleteProject: (id: string) => void;
  onSendMail: (id: number | string, user: string) => void;
}) => {
  const names = Object.entries(props.record.names).map(([code, name]) => ({
    code: code,
    name: name,
  }));
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

  const mapBadgeStatus = (status: 0 | 1 | 2 | undefined) => {
    switch (status) {
      case 0:
        return "success";
      case 1:
        return "warning";
      case 2:
        return "error";
      default:
        return undefined;
    }
  };

  // 自管state处理函数
  const [editPageOpen, setEditPageOpen] = useState<boolean>(false);
  const [editPageConfirmLoading, setEditPageConfirmLoading] =
    useState<boolean>(false);
  const [editUrgentConfirmLoading, setEditUrgentConfirmLoading] =
    useState<boolean>(false);
  const [editReviewerOpen, setEditReviewerOpen] = useState<boolean>(false);
  const [editReviewerConfirmLoading, setEditReviewerConfirmLoading] =
    useState<boolean>(false);
  const [deleteProjectConfirmLoading, setDeleteProjectConfirmLoading] =
    useState<boolean>(false);
  const [resendMailConfirmLoading, setResendMailConfirmLoading] =
    useState<boolean>(false);
  const [sendMailOpen, setSendMailOpen] = useState<boolean>(false);
  const [sendMailConfirmLoading, setSendMailConfirmLoading] =
    useState<boolean>(false);

  const handleEditPage = (id: string, page: number) => {
    setEditPageConfirmLoading(true);
    props.onEditPage(id, page);
    setEditPageConfirmLoading(false);
    setEditPageOpen(false);
  };

  const handleEditUrgent = (id: string, urgent: boolean) => {
    setEditUrgentConfirmLoading(true);
    props.onEditUrgent(id, urgent);
    setEditUrgentConfirmLoading(false);
  };

  const handleEditReviewer = (id: string, user: string) => {
    setEditReviewerConfirmLoading(true);
    props.onEditReviewer(id, user);
    setEditReviewerConfirmLoading(false);
    setEditReviewerOpen(false);
  };

  const handleDeleteProject = (id: string) => {
    setDeleteProjectConfirmLoading(true);
    props.onDeleteProject(id);
    setDeleteProjectConfirmLoading(false);
  };

  const handleResendMail = (id: number | string, user: string) => {
    setResendMailConfirmLoading(true);
    props.onSendMail(id, user);
    setResendMailConfirmLoading(false);
  };

  const handleSendMail = (id: number, user: string) => {
    setSendMailConfirmLoading(true);
    props.onSendMail(id, user);
    setSendMailConfirmLoading(false);
    setSendMailOpen(false);
  };

  return (
    <Descriptions
      size="middle"
      column={{ xxl: 4, xl: 4, lg: 2, md: 2, sm: 2, xs: 2 }}
      labelStyle={{ margin: "auto" }}
    >
      <Descriptions.Item span={2}>
        <List
          dataSource={names}
          size="small"
          itemLayout="vertical"
          style={{ width: "100%" }}
          renderItem={(item) => (
            <List.Item
              key={item.code}
              style={{ padding: "8px 0", width: "100%" }}
            >
              <List.Item.Meta
                avatar={
                  <Tag style={{ margin: "4px 0" }}>
                    {item.code.split("-")[0].slice(9, -4)}
                  </Tag>
                }
                title={item.name}
                description={item.code}
                style={{ margin: "0 0" }}
              />
            </List.Item>
          )}
        />
      </Descriptions.Item>
      <Descriptions.Item label="委托单位" span={2}>
        {props.record.company}
      </Descriptions.Item>
      <Descriptions.Item label="撰写人" span={2}>
        <Space>
          <Text>{props.record.authorname}</Text>
          <Text type="secondary">{formatTimestamp(props.record.start)}</Text>
        </Space>
      </Descriptions.Item>
      <Descriptions.Item label="审核人" span={2}>
        <Space>
          <Text>{props.record.reviewername}</Text>
          <Text type="secondary">
            {props.type === "current"
              ? `${Math.round(
                  (Date.now() / 1000 - props.record.start) / 3600
                )}h`
              : formatTimestamp(props.record.end)}
          </Text>
        </Space>
      </Descriptions.Item>
      <Descriptions.Item label="页数">
        <Space>
          {props.record.pages}
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
                  onFinish={(values: any) =>
                    handleEditPage(props.record.id as string, values.pages)
                  }
                >
                  <Form.Item initialValue={props.record.pages} name="page">
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
                </Form>
              }
            >
              <Button icon={<EditOutlined />} size="small" />
            </Popover>
          ) : undefined}
        </Space>
      </Descriptions.Item>
      <Descriptions.Item label="加急" span={2}>
        <Space>
          {props.record.urgent ? "是" : "否"}
          {props.type === "current" ? (
            <Popconfirm
              title={`修改为${props.record.urgent ? "非" : ""}加急？`}
              okButtonProps={{ loading: editUrgentConfirmLoading }}
              onConfirm={() =>
                handleEditUrgent(
                  props.record.id as string,
                  !props.record.urgent
                )
              }
            >
              <Button icon={<EditOutlined />} size="small" />
            </Popconfirm>
          ) : undefined}
        </Space>
      </Descriptions.Item>
      <Descriptions.Item label="操作" span={2}>
        {props.type === "current" ? (
          <Space wrap>
            <Popconfirm
              title={`重发[报告分配审核]至${props.record.reviewername}？`}
              okText="确认"
              cancelText="取消"
              okButtonProps={{ loading: resendMailConfirmLoading }}
              onConfirm={() =>
                handleResendMail(props.record.id, props.record.reviewerid)
              }
            >
              <Button icon={<MailOutlined />} size="small">
                重发邮件
              </Button>
            </Popconfirm>
            <Popover
              title="选择移交对象"
              trigger="click"
              open={editReviewerOpen}
              onOpenChange={(open) => setEditReviewerOpen(open)}
              content={
                <Form
                  layout="inline"
                  onFinish={(values: any) =>
                    handleEditReviewer(props.record.id as string, values.user)
                  }
                >
                  <Form.Item
                    name="user"
                    rules={[{ required: true, message: "请选择用户" }]}
                  >
                    <Select placeholder="请选择用户">
                      {props.users.map((u) =>
                        u.id !== props.record.reviewerid &&
                        u.id !== props.record.authorid ? (
                          <Select.Option key={u.id}>
                            <Badge
                              status={mapBadgeStatus(u.status)}
                              text={u.name}
                            />
                          </Select.Option>
                        ) : undefined
                      )}
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
              <Button icon={<SwapOutlined />} size="small">
                移交审核
              </Button>
            </Popover>
            <Popconfirm
              title={`删除项目？`}
              okText="确认"
              cancelText="取消"
              okButtonProps={{ loading: deleteProjectConfirmLoading }}
              onConfirm={() => handleDeleteProject(props.record.id as string)}
            >
              <Button icon={<DeleteOutlined />} size="small">
                删除项目
              </Button>
            </Popconfirm>
          </Space>
        ) : (
          <Space wrap>
            <Popconfirm
              title={`重发[报告完成审核]至${props.record.authorname}？`}
              okText="确认"
              cancelText="取消"
              okButtonProps={{ loading: resendMailConfirmLoading }}
              onConfirm={() =>
                handleResendMail(props.record.id, props.record.authorid)
              }
            >
              <Button icon={<MailOutlined />} size="small">
                重发邮件
              </Button>
            </Popconfirm>
            <Popover
              title="选择发送对象"
              trigger="click"
              open={sendMailOpen}
              onOpenChange={(open) => setSendMailOpen(open)}
              content={
                <Form
                  layout="inline"
                  onFinish={(values: any) =>
                    handleSendMail(props.record.id as number, values.user)
                  }
                >
                  <Form.Item
                    name="user"
                    rules={[{ required: true, message: "请选择用户" }]}
                  >
                    <Select placeholder="请选择用户">
                      {props.users.map((u) => (
                        <Select.Option key={u.id}>{u.name}</Select.Option>
                      ))}
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
              <Button icon={<MailOutlined />} size="small">
                获取报告
              </Button>
            </Popover>
          </Space>
        )}
      </Descriptions.Item>
    </Descriptions>
  );
};

export { ProjectList, ProjectTable };
