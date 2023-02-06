import { useState, useEffect } from "react";
import { Breadcrumb, Row, Col, Space, Radio } from "antd";
import { message, Typography } from "antd";
import { Card, Spin } from "antd";
import { Form, Input, Button, Switch } from "antd";
import { List, Badge, Tag, Progress, Popover } from "antd";
import { LoadingOutlined, MailOutlined, MoreOutlined } from "@ant-design/icons";

import axios from "axios";

import type { RadioChangeEvent } from 'antd';
import { QueueItem } from './public/interfaces'
import { mapBadgeStatus } from "./public/interfaces";

const HomeMain = () => {
  // Card: 邮件处理
  const [mailLoading, setMailLoading] = useState<boolean>(false);
  const [mailForm] = Form.useForm();
  const [mailAdvanced, setMailAdvanced] = useState<boolean>(false);
  // Card: 分配队列
  const [refreshTime, setRefreshTime] = useState<number>(Date.now())
  const [queue, setQueue] = useState<Array<QueueItem>>([]);
  const [queueListLoading, setQueueListLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchQueue = async () => {
      setQueueListLoading(true);
      try {
        const response = await axios.post("/api2/queue/list", {})
        if (response.data.result) {
          message.error(`获取失败(${response.data.err})`);
        } else {
          setQueue(response.data.data.queue);
        }
      } catch (error: any) {
        message.error(`获取失败(${error.message})`);
      }
      setQueueListLoading(false);
    };
    fetchQueue();
  }, [refreshTime]);

  const handleMail = async (values: { submit: string, finish: string }) => {
    setMailLoading(true);
    try {
      const response = await axios.post("/api/mail", values)
      if (response.data.result) {
        message.error(`执行失败(${response.data.err})`);
      } else {
        message.success("已加入执行队列");
      }
    } catch (error: any) {
      message.error(`执行失败(${error.message})`);
    };
    setMailLoading(false);
  };

  const handleMailAdvancedSwitch = (checked: boolean) => {
    mailForm.resetFields();
    setMailAdvanced(checked);
  };

  const handleEditStatus = async (id: string, value: 0 | 1 | 2) => {
    try {
      const response = await axios.post("/api2/user/status", { id: id, status: value })
      if (response.data.result) {
        message.error(`设置失败(${response.data.err})`);
      } else {
        message.success("设置成功");
        setRefreshTime(Date.now())
      }
    } catch (error: any) {
      message.error(`设置失败(${error.message})`);
    };
  };

  return (
    <>
      <Breadcrumb style={{ margin: "16px 0" }}>
        <Breadcrumb.Item>Manage</Breadcrumb.Item>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
      </Breadcrumb>
      <Row gutter={[20, 20]}>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Card title="邮件处理">
            <Form
              form={mailForm}
              layout={mailAdvanced ? "vertical" : "inline"}
              onFinish={handleMail}
            >
              <Form.Item>
                <Space direction="horizontal">
                  <Button type="primary" htmlType="submit">
                    {mailLoading ? <LoadingOutlined /> : <MailOutlined />}
                    执行
                  </Button>
                  <Switch onChange={(checked) => handleMailAdvancedSwitch(checked)} />
                  <Typography.Text>自定义关键词</Typography.Text>
                </Space>
              </Form.Item>
              <Form.Item
                hidden={!mailAdvanced}
                name='submit'
                label='提交审核'
                initialValue=''
                rules={[
                  {
                    type: 'string',
                    min: 4,
                    message: '自定义关键词至少需要4个字符',
                  },
                ]}
              >
                <Input placeholder='[提交审核]' />
              </Form.Item>
              <Form.Item
                hidden={!mailAdvanced}
                name='finish'
                label='完成审核'
                initialValue=''
                rules={[
                  {
                    type: 'string',
                    min: 4,
                    message: '自定义关键词至少需要4个字符',
                  },
                ]}
              >
                <Input placeholder='[完成审核]' />
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Card title="分配队列">
            <Spin spinning={queueListLoading} delay={500}>
              <List
                dataSource={queue}
                rowKey={(item) => item.id}
                renderItem={(item) => (
                  <List.Item
                    extra={<Progress percent={item.current * 33} steps={3} showInfo={false} />}
                  >
                    <Space>
                      <Badge status={mapBadgeStatus(item.status)} text={item.name} />
                      <Popover
                        placement="right"
                        content={
                          <Radio.Group
                            defaultValue={item.status}
                            onChange={(e: RadioChangeEvent) => handleEditStatus(item.id, e.target.value)}
                          >
                            <Space direction="vertical">
                              <Radio value={0}><Badge status="success" text="空闲" /></Radio>
                              <Radio value={1}><Badge status="warning" text="不审加急" /></Radio>
                              <Radio value={2}><Badge status="error" text="不审报告" /></Radio>
                            </Space>
                          </Radio.Group>
                        }
                      >
                        <MoreOutlined />
                      </Popover>
                      {item.skipped ? <Tag color="default">跳过一篇</Tag> : undefined}
                    </Space>
                  </List.Item>
                )}
              />
            </Spin>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default HomeMain;