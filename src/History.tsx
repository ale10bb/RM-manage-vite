import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { Button } from "antd";
import { Row, Col, Space } from "antd";
import { Breadcrumb } from "antd";
import { Form, Input } from "antd";
import { Card } from "antd";
import { message, Spin } from "antd";

import axios from "./public/axios-config";
import { ProjectTable } from "./public/Project";
import { ProjectItem, HistoryTableConfig } from "./public/interfaces";

const HistoryMain = () => {
  // 表单及结果表格
  const [tableData, setTableData] = useState<{
    project: Array<ProjectItem>;
    total: number;
  }>({ project: [], total: 0 });
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [historyTableConfig, setHistoryTableConfig] =
    useState<HistoryTableConfig>({
      code: "",
      name: "",
      company: "",
      author: "",
      current: 1,
      pageSize: 10,
    });

  useEffect(() => {
    const fetchHistory = async () => {
      setTableLoading(true);
      try {
        const response = await axios.post(
          "/api/history/search",
          historyTableConfig
        );
        if (response.data.result) {
          message.error(`获取失败(${response.data.err})`);
        } else {
          setTableData({
            project: response.data.data.history,
            total: response.data.data.total,
          });
        }
      } catch (error: any) {
        message.error(`获取失败(${error.message})`);
      }
      setTableLoading(false);
    };
    fetchHistory();
  }, [JSON.stringify(historyTableConfig)]);

  const handleSubmit = (values: any) => {
    setHistoryTableConfig(Object.assign({}, historyTableConfig, values));
  };

  const handlePageChange = (
    current: number | undefined,
    pageSize: number | undefined
  ) => {
    setHistoryTableConfig(
      Object.assign({}, historyTableConfig, {
        current: current,
        pageSize: pageSize,
      })
    );
  };

  return (
    <>
      <Breadcrumb
        items={[
          { href: "/manage/dashboard", title: "工作台" },
          { title: "历史项目" },
        ]}
      />
      <Card style={{ margin: "16px 0" }}>
        <Form layout="inline" onFinish={handleSubmit}>
          <Row gutter={[20, 20]}>
            <Col xs={24} sm={12} md={12} lg={8} xl={6}>
              <Form.Item name="code" label="项目编号">
                <Input placeholder="SHTEC2099PRO9999" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={8} xl={6}>
              <Form.Item name="name" label="项目名称">
                <Input placeholder="网站系统" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={8} xl={6}>
              <Form.Item name="company" label="委托单位">
                <Input placeholder="XXX中心" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={8} xl={6}>
              <Form.Item name="author" label="撰写人">
                <Input placeholder="张三三/zhangss" />
              </Form.Item>
            </Col>
            <Col span={24} style={{ textAlign: "right" }}>
              <Form.Item>
                <Space direction="horizontal" size="middle">
                  <Button htmlType="reset">重置</Button>
                  <Button type="primary" htmlType="submit">
                    搜索
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
      <Spin spinning={tableLoading}>
        <ProjectTable
          data={tableData}
          pagination={{
            current: historyTableConfig.current,
            pageSize: historyTableConfig.pageSize,
          }}
          onPageChange={handlePageChange}
        />
      </Spin>
    </>
  );
};

export default HistoryMain;
