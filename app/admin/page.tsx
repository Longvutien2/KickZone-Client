'use client';
import { Card, Row, Col, Statistic, Divider } from 'antd';
import { Line } from '@ant-design/charts';  // Dùng cho Line chart
import { Pie } from '@ant-design/charts';  // Dùng cho Pie chart
import { Bar } from '@ant-design/charts';
const Dashboard = () => {
  // Dữ liệu cho Line Chart
  const lineData = [
    { date: '09/12', count: 3 },
    { date: '10/12', count: 5 },
    { date: '11/12', count: 7 },
    { date: '12/12', count: 6 },
    { date: '13/12', count: 8 },
    { date: '14/12', count: 16 },
    { date: '15/12', count: 12 },
  ];

  // Dữ liệu cho Pie Chart
  const pieData = [
    { type: 'Học sinh', value: 39 },
    { type: 'Giảng viên', value: 3 },
    { type: 'Admin', value: 3 },
  ];

  // Cấu hình Line Chart
  const lineConfig = {
    data: lineData,
    xField: 'date',
    yField: 'count',
    point: {
      size: 5,
      shape: 'diamond',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
    color: ['#5B8FF9'], // Thêm màu cho đường line
  };

  // Cấu hình Pie Chart
  const pieConfig = {
    appendPadding: 10,
    data: pieData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    legend: {
      position: 'bottom',
    },
    color: ['#5B8FF9', '#5AD8A6', '#F6C0D1'], // Màu sắc cho các phần trong Pie chart
  };

  return (
    <div className="container mx-auto p-6">
      {/* Statistic Cards */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="Số lượng người dùng" value={45} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Số ngày đăng có" value={35} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Số tuần đăng có" value={6} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Số lượt làm bài" value={415} />
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Line Chart */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Số lượt làm bài trong 7 ngày gần nhất">
            <Line {...lineConfig} />
          </Card>
        </Col>

        {/* Pie Chart */}
        <Col span={12}>
          <Card title="Số lượng người dùng">
            <Pie {...pieConfig} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
