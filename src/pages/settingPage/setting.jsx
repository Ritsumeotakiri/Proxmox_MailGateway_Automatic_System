import React, { useState, useEffect } from 'react';
import '../../styles/setting.css';
import PMGConnectionModal from '../../components/setting_PMG_model';
import { getQuarantineSettings, saveQuarantineSettings } from '../../api/settingsApi';
import { fetchCurrentUser } from '../../api/auth/auth';  // import your fetchCurrentUser
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function SettingsPage() {
  // Quarantine settings state
  const [autoClean, setAutoClean] = useState(false);
  const [deleteAfter, setDeleteAfter] = useState(7);
  const [cleanupInterval, setCleanupInterval] = useState('Daily');

  // Modal state
  const [showModal, setShowModal] = useState(false);

  // Profile state (use keys according to your backend's user model)
  const [profile, setProfile] = useState({
    name: '',
    email: '',
  });

  // Load settings and user profile on component mount
  useEffect(() => {
    // Load quarantine settings
    getQuarantineSettings()
      .then(data => {
        if (data) {
          setAutoClean(data.autoClean);
          setDeleteAfter(data.deleteOlderThanDays);
          setCleanupInterval(data.cleanupInterval);
        }
      })
      .catch(() => {
        toast.error('❌ Failed to load settings. Please try again later.', {
          position: "top-right",
          autoClose: 5000,
        });
      });

    // Load current user profile from API
    fetchCurrentUser()
      .then(user => {
        // Assuming your user object has 'name' and 'email'
        setProfile({
          name: user.name || '',
          email: user.email || '',
        });
      })
      .catch(() => {
        toast.error('❌ Failed to load user profile. Please try again later.', {
          position: "top-right",
          autoClose: 5000,
        });
      });
  }, []);

  // Save quarantine settings
  const handleSaveSettings = async () => {
    const payload = {
      autoClean,
      deleteOlderThanDays: Number(deleteAfter),
      cleanupInterval,
    };

    try {
      await saveQuarantineSettings(payload);
      toast.success('✅ Settings saved!', { position: "top-right", autoClose: 5000 });
    } catch (error) {
      toast.error('❌ Failed to save settings. Please try again later.', { position: "top-right", autoClose: 5000 });
    }
  };

  // Save profile info (replace with real API call to update user profile)
  const handleSaveProfile = () => {
    // TODO: call your API to update profile here
    toast.success('✅ Profile updated!', { position: "top-right", autoClose: 5000 });
  };

  // Handle profile input change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  return (
    <main className="settings-page">
      {/* PMG Connection Settings */}
      <SettingsCard title="PMG Connection Settings">
        <tr
          className="border-t cursor-pointer hover:bg-gray-50 transition"
          onClick={() => setShowModal(true)}
        >
          <td className="px-4 py-3">PMG Connection</td>
          <td className="px-4 py-3">Active</td>
          <td className="px-4 py-3"></td>
          <td className="px-4 py-3 text-center">⋮</td>
        </tr>
      </SettingsCard>

      {/* Telegram Bot Settings */}
      <SettingsCard title="Telegram Bot Settings">
        <tr className="border-t">
          <td className="px-4 py-3">Telegram Bot</td>
          <td className="px-4 py-3">Ritt PMG</td>
          <td className="px-4 py-3">Active</td>
          <td className="px-4 py-3 text-center">⋮</td>
        </tr>
      </SettingsCard>

      {/* Profile Settings */}
      <SettingsCard title="Profile Settings">
        <tr className="border-t">
          <td className="px-4 py-3">Name</td>
          <td className="px-4 py-3" colSpan="3">
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleProfileChange}
              className="input-field"
              placeholder="Name"
            />
          </td>
        </tr>
        <tr className="border-t">
          <td className="px-4 py-3">Email</td>
          <td className="px-4 py-3" colSpan="3">
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleProfileChange}
              className="input-field"
              placeholder="Email"
            />
          </td>
        </tr>
        <tr>
          <td colSpan="4" className="py-3 text-right">
            <button className="save-btn" onClick={handleSaveProfile}>
              Save Profile
            </button>
          </td>
        </tr>
      </SettingsCard>

      {/* Quarantine Cleanup Settings */}
      <div className="settings-card" style={{ width: '320px' }}>
        <table>
          <thead>
            <tr>
              <th colSpan="2">Quarantine Cleanup Settings</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="py-3">Auto-clean Quarantine</td>
              <td className="py-3 text-right">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={autoClean}
                    onChange={() => setAutoClean(prev => !prev)}
                  />
                  <span className="slider round"></span>
                </label>
              </td>
            </tr>
            <tr className="border-t">
              <td className="py-3">
                Delete Mails
                <br />
                Older than
              </td>
              <td className="py-3 text-right">
                <select
                  className="dropdown"
                  value={deleteAfter}
                  onChange={e => setDeleteAfter(Number(e.target.value))}
                >
                  <option value={3}>3 Days</option>
                  <option value={7}>7 Days</option>
                  <option value={14}>14 Days</option>
                </select>
              </td>
            </tr>
            <tr className="border-t">
              <td className="py-3">Cleanup Interval</td>
              <td className="py-3 text-right">
                <select
                  className="dropdown"
                  value={cleanupInterval}
                  onChange={e => setCleanupInterval(e.target.value)}
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="5min">Every 5 Minutes</option>
                  <option value="Hourly">Hourly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </td>
            </tr>
            <tr>
              <td colSpan="2" className="py-3 text-right">
                <button className="save-btn" onClick={handleSaveSettings}>
                  Save Settings
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* PMG Modal */}
      <PMGConnectionModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => setShowModal(false)}
      />

      {/* Toast notifications */}
      <ToastContainer />
    </main>
  );
}

function SettingsCard({ title, children }) {
  return (
    <div className="settings-card">
      <table>
        <thead>
          <tr>
            <th colSpan="4">{title}</th>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export default SettingsPage;
