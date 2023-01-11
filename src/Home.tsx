import { useState, useEffect } from "react";
import { Breadcrumb, Row, Col, Space } from "antd";
import { message, Typography } from "antd";
import { Card } from "antd";
import { Form, Input, Button, Switch } from "antd";
import { List, Badge, Tag, Progress, Select } from "antd";
import { LoadingOutlined, MailOutlined, CaretDownOutlined } from "@ant-design/icons";

import axios from "axios";

import { QueueItem } from './public/interfaces'

const HomeMain = () => {
  // Card: 邮件处理
  const [mailLoading, setMailLoading] = useState<boolean>(false);
  const [mailForm] = Form.useForm();
  const [mailAdvanced, setMailAdvanced] = useState<boolean>(false);
  // Card: 分配队列
  const [queue, setQueue] = useState<Array<QueueItem>>([]);
  const [queueListLoading, setQueueListLoading] = useState<boolean>(true);

  useEffect(() => {
    setQueueListLoading(true);
    axios.post(
      "/api2/queue/list",
      {}
    ).then((response) => {
      if (response.data.result) {
        message.error(`获取失败(${response.data.err})`);
      }
      else {
        setQueue(response.data.data.queue);
      }
    }).catch(function (error) {
      message.error(`获取失败(${error.message})`);
    });
    setQueueListLoading(false);
  }, []);

  const handleMail = async (values: { submit: string, finish: string }) => {
    setMailLoading(true);
    axios.post("/api/mail", values).then((response) => {
      if (response.data.result) {
        message.error(`执行失败(${response.data.err})`);
      }
      else {
        message.success("已加入执行队列");
      }
    }).catch(function (error) {
      message.error(`执行失败(${error.message})`);
    });
    setMailLoading(false);
  };

  const handleMailAdvancedSwitch = (checked: boolean) => {
    mailForm.resetFields();
    setMailAdvanced(checked);
  };

  const handleEditStatus = (value: number, user: QueueItem) => {
    axios.post(
      "/api2/user/status",
      { id: user.id, status: value }
    ).then((response) => {
      if (response.data.result) {
        message.error(`设置失败(${response.data.err})`);
      }
      else {
        message.success("设置成功");
      }
    }).catch(function (error) {
      message.error(`设置失败(${error.message})`);
    });
  }

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
            <List
              dataSource={queue}
              loading={queueListLoading}
              size="small"
              rowKey={(item) => item.id}
              renderItem={(item) => (
                <List.Item
                  style={{ padding: "8px 0" }}
                  extra={<Progress percent={item.current * 33} steps={3} showInfo={false} />}
                >
                  <Space size={2}>
                    <Select
                      defaultValue={item.status}
                      bordered={false}
                      style={{ width: "200px" }}
                      showArrow={false}
                      optionLabelProp="render"
                      onSelect={(value: number) => handleEditStatus(value, item)}
                    >
                      <Select.Option
                        value={0}
                        render={
                          <Space>
                            <CaretDownOutlined style={{ color: 'green' }} />
                            {item.name}
                            {item.skipped ? <Tag color="default">跳过一篇</Tag> : undefined}
                          </Space>
                        }>
                        <Badge status="success" text="空闲" />
                      </Select.Option>
                      <Select.Option
                        value={1}
                        render={
                          <Space>
                            <CaretDownOutlined style={{ color: 'orange' }} />
                            {item.name}
                            <Tag color="warning">忙碌</Tag>
                            {item.skipped ? <Tag color="default">跳过一篇</Tag> : undefined}
                          </Space>
                        }>
                        <Badge status="warning" text="不审加急" />
                      </Select.Option>
                      <Select.Option
                        value={2}
                        render={
                          <Space>
                            <CaretDownOutlined style={{ color: 'red' }} />
                            {item.name}
                            <Tag color="error">不审</Tag>
                            {item.skipped ? <Tag color="default">跳过一篇</Tag> : undefined}
                          </Space>
                        }>
                        <Badge status="error" text="不审报告" />
                      </Select.Option>
                    </Select>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default HomeMain;