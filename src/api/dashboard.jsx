export const fetchDashboardStats = async () => {
  const res = await fetch('/api/dashboard/overview', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return await res.json();
};
