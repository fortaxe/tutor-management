
import React, { useMemo } from 'react';
import { User, Gym, Member, GymStatus, SubscriptionStatus } from '../types';
import DashboardLayout from '../components/DashboardLayout';
import Badge from '../components/Badge';

interface SuperAdminDashboardProps {
  user: User;
  gyms: Gym[];
  members: Member[];
  onLogout: () => void;
  onToggleGymStatus: (gymId: number, currentStatus: GymStatus) => void;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ user, gyms, members, onLogout, onToggleGymStatus }) => {
  const getMemberCount = (gymId: number) => {
    return members.filter(member => member.gymId === gymId).length;
  };

  const gymsWithMemberCount = useMemo(() => {
    return gyms.map(gym => ({
      ...gym,
      memberCount: getMemberCount(gym.id),
    }));
  }, [gyms, members]);

  const subscriptionStatusBadge = (status: SubscriptionStatus) => {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return <Badge color="green">Active</Badge>;
      case SubscriptionStatus.PENDING:
        return <Badge color="yellow">Pending</Badge>;
      case SubscriptionStatus.EXPIRED:
        return <Badge color="red">Expired</Badge>;
      default:
        return <Badge color="gray">Unknown</Badge>;
    }
  };

  const gymStatusBadge = (status: GymStatus) => {
    switch (status) {
      case GymStatus.ACTIVE:
        return <Badge color="green">Active</Badge>;
      case GymStatus.SUSPENDED:
        return <Badge color="red">Suspended</Badge>;
      case GymStatus.INACTIVE:
        return <Badge color="gray">Inactive</Badge>;
      default:
        return <Badge color="gray">Unknown</Badge>;
    }
  };

  return (
    <DashboardLayout user={user} onLogout={onLogout} pageTitle="Super Admin Dashboard">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Manage Gyms</h3>
        <p className="text-sm text-gray-600 mb-6">
          Platform Subscription Fee: INR 300 per month per gym.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gym Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Members</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gym Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Payment Due</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {gymsWithMemberCount.map((gym) => (
                <tr key={gym.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{gym.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gym.ownerEmail}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{gym.memberCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gymStatusBadge(gym.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subscriptionStatusBadge(gym.subscriptionStatus)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(gym.nextPaymentDue).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onToggleGymStatus(gym.id, gym.status)}
                      className={`px-3 py-1 text-xs rounded-full ${
                        gym.status === GymStatus.ACTIVE ? 'bg-red-100 text-red-800 hover:bg-red-200' : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {gym.status === GymStatus.ACTIVE ? 'Suspend' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
       <div className="bg-white p-6 rounded-lg shadow mt-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Payment Gateway Integration</h3>
        <p className="text-sm text-gray-600">
            Payment gateway webhooks (e.g., from Stripe or Razorpay) would be handled on the backend. 
            When a successful payment event is received for a gym's subscription, the backend would update the gym's `subscriptionStatus` to 'Active' and set the `nextPaymentDue` date to one month in the future.
            This frontend is ready to display those changes once the backend logic is implemented.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
