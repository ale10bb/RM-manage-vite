import { useState, useEffect } from "react";
import { Breadcrumb } from "antd";
import { message } from "antd";
import { Card, Spin } from "antd";

import axios from "axios";

import { ProjectTable } from "./public/Project";
import { ProjectItem, UserItem } from "./public/interfaces"

const CurrentMain = () => {
  // 结果表格
  const [refreshTime, setRefreshTime] = useState<number>(Date.now())
  const [tableData, setTableData] = useState<{
    project: Array<ProjectItem>,
    total: number,
  }>({ project: [], total: 0 });
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [currentTableConfig, setCurrentTableConfig] = useState(
    { current: 1, pageSize: 10 }
  );
  // 用户列表（用于选择邮件发送对象），current情况下获取审核人
  const [userData, setUserData] = useState<Array<UserItem>>([]);

  useEffect(() => {
    const fetchUser = async () => {
      axios.post(
        "/api/user/list",
        { isReviewer: true }
      ).then((response) => {
        if (response.data.result) {
          message.error(`获取失败(${response.data.err})`);
        } else {
          setUserData(response.data.data.user);
        }
      }).catch(function (error) {
        message.error(`获取失败(${error.message})`);
      });
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchCurrent = async () => {
      setTableLoading(true);
      try {
        const response = await axios.post("/api/current/list", {})
        if (response.data.result) {
          message.error(`获取失败(${response.data.err})`);
        } else {
          setTableData({
            project: response.data.data.current,
            total: response.data.data.total,
          });
        }
      } catch (error: any) {
        message.error(`获取失败(${error.message})`);
      };
      setTableLoading(false);
    };
    fetchCurrent();
  }, [refreshTime, JSON.stringify(currentTableConfig)]);

  const handlePageChange = (current: number | undefined, pageSize: number | undefined) => {
    setCurrentTableConfig(Object.assign(currentTableConfig, { current: current, pageSize: pageSize }));
  };

  return (
    <>
      <Breadcrumb style={{ margin: "16px 0" }}>
        <Breadcrumb.Item>Manage</Breadcrumb.Item>
        <Breadcrumb.Item>当前项目</Breadcrumb.Item>
      </Breadcrumb>
      <Card>
        <Spin spinning={tableLoading}>
          <ProjectTable
            type="current"
            data={tableData}
            user={userData}
            pagination={{ current: currentTableConfig.current, pageSize: currentTableConfig.pageSize }}
            onPageChange={handlePageChange}
            onDataChange={() => setRefreshTime(Date.now())}
          />
        </Spin>
      </Card>
    </>
  );
};

export default CurrentMain;
