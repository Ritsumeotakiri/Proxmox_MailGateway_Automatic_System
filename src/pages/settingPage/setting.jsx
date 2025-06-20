import React, { useState } from 'react';
import '../../styles/setting.css';
import PMGConnectionModal from '../../components/setting_PMG_model'; 

function SettingsPage() {
    const [autoClean, setAutoClean] = useState(true);
    const [deleteAfter, setDeleteAfter] = useState('7 Days');
    const [cleanupInterval, setCleanupInterval] = useState('Daily');
    const [showModal, setShowModal] = useState(false);

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
                    <td className="px-4 py-3">PMG Connection</td>
                    <td className="px-4 py-3">Ritt PMG</td>
                    <td className="px-4 py-3">Active</td>
                    <td className="px-4 py-3 text-center">⋮</td>
                </tr>
            </SettingsCard>

            {/* General Settings */}
            <SettingsCard title="General Settings">
                <tr className="border-t">
                    <td className="px-4 py-3">PMG Connection</td>
                    <td className="px-4 py-3">Ritt PMG</td>
                    <td className="px-4 py-3">Active</td>
                    <td className="px-4 py-3 text-center">⋮</td>
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
                                        onChange={() => setAutoClean(!autoClean)}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </td>
                        </tr>
                        <tr className="border-t">
                            <td className="py-3">Delete Mails<br />Older than</td>
                            <td className="py-3 text-right">
                                <select className="dropdown" value={deleteAfter} onChange={e => setDeleteAfter(e.target.value)}>
                                    <option>3 Days</option>
                                    <option>7 Days</option>
                                    <option>14 Days</option>
                                </select>
                            </td>
                        </tr>
                        <tr className="border-t">
                            <td className="py-3">Cleanup Interval</td>
                            <td className="py-3 text-right">
                                <select className="dropdown" value={cleanupInterval} onChange={e => setCleanupInterval(e.target.value)}>
                                    <option>Daily</option>
                                    <option>Weekly</option>
                                </select>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* PMG Modal */}
            <PMGConnectionModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={() => {
                    // handle confirm
                    setShowModal(false);
                }}
            />
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
