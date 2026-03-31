import React from 'react';
import { FiUsers, FiCalendar, FiTrendingUp, FiSettings } from 'react-icons/fi';

const AdminDashboardPage: React.FC = () => {
  const stats = [
    { icon: <FiUsers className="text-2xl" />, title: 'Total Users', value: '1,234' },
    { icon: <FiCalendar className="text-2xl" />, title: 'Total Turfs', value: '456' },
    { icon: <FiTrendingUp className="text-2xl" />, title: 'Monthly Revenue', value: '₹45,678' },
    { icon: <FiSettings className="text-2xl" />, title: 'Pending Approvals', value: '12' },
  ];

  return (
    <div className="container-max py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">{stat.value}</p>
              </div>
              <div className="text-4xl text-blue-100">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Features */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-bold mb-4">Pending Turf Approvals</h3>
          <div className="space-y-3">
            <p className="text-gray-600 text-center py-8">No pending approvals</p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold mb-4">Recent Bookings</h3>
          <div className="space-y-3">
            <p className="text-gray-600 text-center py-8">No recent bookings</p>
          </div>
        </div>

        <div className="card md:col-span-2">
          <h3 className="text-lg font-bold mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span>Database</span>
              <span className="badge badge-success">Healthy</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span>Payment Gateway</span>
              <span className="badge badge-success">Connected</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Email Service</span>
              <span className="badge badge-success">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
