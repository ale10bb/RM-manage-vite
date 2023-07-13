import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { Button, List, Space, Typography } from "antd";
const { Text } = Typography;
import { Row, Col } from "antd";
import { Form, Input } from "antd";
import { Card, Tag, Tooltip } from "antd";
import { message, Spin } from "antd";
import { Collapse } from "antd";
import {
  EllipsisOutlined,
  LoadingOutlined,
  MailOutlined,
} from "@ant-design/icons";

import axios from "./public/axios-config";
import { ProjectItem, UserItem } from "./public/interfaces";
import { ProjectList } from "./public/Project";

const Dashboard = () => {
  // Card: 邮件处理
  const [mailLoading, setMailLoading] = useState<boolean>(false);
  const [mailForm] = Form.useForm();
  const [queueData, setQueueData] = useState<Array<UserItem>>([]);
  // Card: 我的任务
  const [refreshTime, setRefreshTime] = useState<number>(Date.now());
  const [currentData, setCurrentData] = useState<{
    project: Array<ProjectItem>;
    total: number;
  }>({ project: [], total: 0 });
  const [currentLoading, setCurrentLoading] = useState<boolean>(true);
  const [currentTableConfig, setCurrentTableConfig] = useState({
    current: 1,
    pageSize: 10,
  });
  const cachedUser = sessionStorage.getItem("user");
  const userInfo: UserItem | undefined = !!cachedUser
    ? JSON.parse(cachedUser)
    : undefined;
  const validReviewer = (reviewer: UserItem) => {
    return (
      (reviewer.status === 0 || reviewer.status === 1) &&
      userInfo?.id !== reviewer.id
    );
  };
  const nextReviewer = queueData.find(validReviewer);

  useEffect(() => {
    const fetchCurrent = async () => {
      try {
        const response = await axios.post("/api/current/list", {});
        if (response.data.result) {
          message.error(`获取失败(${response.data.err})`);
        } else {
          setCurrentData({
            project: response.data.data.current,
            total: response.data.data.total,
          });
        }
      } catch (error: any) {
        message.error(`获取失败(${error.message})`);
      }
      setCurrentLoading(false);
    };
    const fetchQueue = async () => {
      try {
        const response = await axios.post("/api/queue/list", {});
        if (response.data.result) {
          message.error(`获取失败(${response.data.err})`);
        } else {
          setQueueData(response.data.data.queue);
        }
      } catch (error: any) {
        message.error(`获取失败(${error.message})`);
      }
    };
    fetchCurrent();
    fetchQueue();
  }, [refreshTime, JSON.stringify(currentTableConfig)]);

  const handleMail = async () => {
    setMailLoading(true);
    try {
      const response = await axios.post("/api/mail", mailForm.getFieldsValue());
      if (response.data.result) {
        message.error(`执行失败(${response.data.err})`);
      } else {
        message.success(`处理邮件中 (${response.data.data.entryid})`);
      }
    } catch (error: any) {
      message.error(`执行失败(${error.message})`);
    }
    setMailLoading(false);
  };

  const handlePageChange = (
    current: number | undefined,
    pageSize: number | undefined
  ) => {
    setCurrentTableConfig(
      Object.assign(currentTableConfig, {
        current: current,
        pageSize: pageSize,
      })
    );
  };

  const onMailCollapseChange = (key: string | string[]) => {
    if (!key || key.length === 0) {
      mailForm.resetFields();
    }
  };

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Collapse
          collapsible="icon"
          expandIconPosition="end"
          onChange={onMailCollapseChange}
        >
          <Collapse.Panel
            header={
              <Space>
                <Button
                  type="primary"
                  shape="round"
                  icon={mailLoading ? <LoadingOutlined /> : <MailOutlined />}
                  onClick={() => handleMail()}
                ></Button>
                <Text>打机器人</Text>
                <Tooltip
                  title={<QueueList data={queueData} />}
                  color="white"
                  placement="bottomRight"
                >
                  {nextReviewer ? (
                    <Space>
                      <Text type="secondary">{`-> ${nextReviewer.name}`}</Text>
                      <EllipsisOutlined />
                    </Space>
                  ) : undefined}
                </Tooltip>
              </Space>
            }
            key={0}
          >
            <Form form={mailForm} layout="horizontal">
              <Form.Item
                name="submit"
                label="“提交审核”自定义关键词"
                initialValue=""
                rules={[
                  {
                    type: "string",
                    min: 4,
                    message: "自定义关键词至少需要4个字符",
                  },
                ]}
              >
                <Input placeholder="[提交审核]" />
              </Form.Item>
              <Form.Item
                name="finish"
                label="“完成审核”自定义关键词"
                initialValue=""
                rules={[
                  {
                    type: "string",
                    min: 4,
                    message: "自定义关键词至少需要4个字符",
                  },
                ]}
              >
                <Input placeholder="[完成审核]" />
              </Form.Item>
            </Form>
          </Collapse.Panel>
        </Collapse>
      </Col>
      <Col span={24}>
        <Spin spinning={currentLoading}>
          <Card
            title="我的任务"
            extra={<Link to={"/manage/history"}>历史项目</Link>}
          >
            <ProjectList
              type="current"
              data={currentData}
              pagination={{
                current: currentTableConfig.current,
                pageSize: currentTableConfig.pageSize,
              }}
              onPageChange={handlePageChange}
              onDataChange={() => setRefreshTime(Date.now())}
            />
          </Card>
        </Spin>
      </Col>
    </Row>
  );
};

const QueueList = (props: { data: Array<UserItem> }) => {
  const mapTag = (status: 0 | 1 | 2 | undefined) => {
    switch (status) {
      case 0:
        return <Tag color="green">空闲</Tag>;
      case 1:
        return <Tag color="warning">忙碌</Tag>;
      case 2:
        return <Tag color="error">不审</Tag>;
      default:
        return undefined;
    }
  };
  return (
    <List
      size="small"
      dataSource={props.data}
      renderItem={(item) => (
        <List.Item key={item.priority}>
          <Space align="center">
            {`${item.priority}. ${item.name}`}
            {mapTag(item.status)}
          </Space>
        </List.Item>
      )}
    />
  );
};

export default Dashboard;
