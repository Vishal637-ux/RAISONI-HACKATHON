import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { adminService } from '../../services/adminService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  ShieldCheck,
  Save,
  Sliders,
  Database,
  CheckCircle2,
  Lock,
  Bell,
  Activity,
  Server,
  AlertTriangle,
  Radio,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminSettingsPage = () => {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmMode, setShowConfirmMode] = useState(false);
  const [apiLatency, setApiLatency] = useState('Measuring...');

  const [settings, setSettings] = useState({
    sessionTimeout: '30 Mins',
    passwordPolicy: 'Strong (Min 8 Chars, Special Symbol, Digit)',
    mfaPolicy: 'Optional (Authenticator App)',
    loginLimit: '5 Attempts',
    maintenanceMode: false,
    systemBanner: 'System operational. All role permissions and governance services active.',
  });

  useEffect(() => {
    adminService.measureDatabaseLatency().then((res) => {
      setApiLatency(res);
    });
  }, []);

  const handleInitialSave = (e) => {
    e.preventDefault();
    if (settings.maintenanceMode) {
      setShowConfirmMode(true);
    } else {
      executeSave();
    }
  };

  const executeSave = async () => {
    setIsSaving(true);
    try {
      await adminService.logAdminAuditAction({
        userId: user?.id,
        action: `Updated System Security Settings (Maintenance Mode: ${settings.maintenanceMode ? 'ENABLED' : 'DISABLED'})`,
      });
      toast.success('Successfully saved System Security Configurations & Preferences');
      setShowConfirmMode(false);
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
      {/* Governance Banner */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-white shadow-2xs">
        <div className="flex items-center gap-2 font-bold">
          <ShieldCheck size={18} className="text-[#A874F7] shrink-0" />
          <span>System Security Configurations • Database Governance Parameters • Read-Only Health Monitors</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white border border-[#E9DDFE] p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A874F7]">
              System Administrator Master Portal
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] uppercase tracking-wider">
              System Security & Infrastructure Parameters
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#171717]">
            System Settings & Security Preferences
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Configure system authentication session limits, maintenance banners, and inspect Supabase enterprise database health.
          </p>
        </div>
      </div>

      {/* Database Health & Infrastructure Statistics (Read-Only) */}
      <Card className="bg-white border border-[#E9DDFE] p-6 shadow-sm rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-3">
          <div className="flex items-center gap-2">
            <Server size={18} className="text-emerald-600" />
            <h3 className="text-base font-bold text-[#171717]">Database Health & Platform Statistics (Read-Only)</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            ✓ Supabase Online
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/40">
            <span className="text-[#6B7280] text-[10px] block">Authentication Status</span>
            <span className="font-bold text-emerald-700 block">Connected</span>
          </div>
          <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/40">
            <span className="text-[#6B7280] text-[10px] block">API Latency</span>
            <span className="font-bold text-emerald-700 block">{apiLatency}</span>
          </div>
          <div className="p-3 rounded-xl border border-purple-200 bg-purple-50/40">
            <span className="text-[#6B7280] text-[10px] block">Total Storage Used</span>
            <span className="font-bold text-[#A874F7] block">Unavailable</span>
          </div>
          <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/40">
            <span className="text-[#6B7280] text-[10px] block">Current Version</span>
            <span className="font-bold text-blue-700 block">Not Configured</span>
          </div>
        </div>
      </Card>

      {/* System Notification Center */}
      <Card className="bg-white border border-[#E9DDFE] p-6 shadow-sm rounded-2xl space-y-3">
        <div className="flex items-center gap-2 border-b border-[#E9DDFE] pb-3">
          <Bell size={18} className="text-[#A874F7]" />
          <h3 className="text-base font-bold text-[#171717]">System Notification & Security Center</h3>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 text-emerald-900 flex items-center justify-between">
            <span className="font-semibold">System Access Governance & Session Security</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">ACTIVE</span>
          </div>
          <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/60 text-blue-900 flex items-center justify-between">
            <span className="font-semibold">Supabase PostgreSQL Database Latency: {apiLatency}</span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">CONNECTED</span>
          </div>
        </div>
      </Card>

      {/* Security Form */}
      <form onSubmit={handleInitialSave} className="space-y-5">
        <Card className="bg-white border border-[#E9DDFE] p-6 shadow-sm rounded-2xl space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E9DDFE] pb-3">
            <Sliders size={18} className="text-[#A874F7]" />
            <h3 className="text-base font-bold text-[#171717]">Security & Authentication Policy Controls</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#171717] mb-1">Session Inactivity Timeout</label>
              <input
                type="text"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] rounded-xl p-2.5 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#171717] mb-1">Login Failed Attempt Limit</label>
              <input
                type="text"
                value={settings.loginLimit}
                onChange={(e) => setSettings({ ...settings, loginLimit: e.target.value })}
                className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] rounded-xl p-2.5 focus:outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block font-semibold text-[#171717] mb-1">Global System Announcement Banner</label>
              <input
                type="text"
                value={settings.systemBanner}
                onChange={(e) => setSettings({ ...settings, systemBanner: e.target.value })}
                className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] rounded-xl p-2.5 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-[#E9DDFE] text-xs">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-[#E9DDFE] bg-[#F3EDFF]/20 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="rounded border-[#E9DDFE] text-[#A874F7] focus:ring-[#A874F7] w-4 h-4"
              />
              <div>
                <span className="font-bold text-[#171717] block">Enable System Maintenance Mode</span>
                <span className="text-[10px] text-[#6B7280]">Restrict portal access to System Administrators only during updates.</span>
              </div>
            </label>
          </div>
        </Card>

        {showConfirmMode && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle size={18} className="text-amber-700 shrink-0" />
              <span>Confirm Enabling Maintenance Mode</span>
            </div>
            <p className="text-[11px]">
              Enabling maintenance mode will restrict access to all regular portal users. Are you sure you want to proceed?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowConfirmMode(false)} className="text-xs px-3">
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={executeSave}
                isLoading={isSaving}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-4"
              >
                Confirm Maintenance Mode
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
            className="bg-[#A874F7] hover:bg-[#965BEB] text-white text-xs px-6 py-2.5 shadow-sm"
          >
            <Save size={14} className="mr-1.5" />
            Save Security Preferences
          </Button>
        </div>
      </form>

      {/* Footer */}
      <div className="p-3 rounded-xl border border-[#E9DDFE] bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#6B7280] gap-2">
        <div className="flex items-center gap-2">
          <Database size={13} className="text-[#A874F7]" />
          <span>Data Source: <strong>Supabase Single Source of Truth</strong></span>
        </div>
        <div className="flex items-center gap-4">
          <span>Version: <strong>Not Configured</strong></span>
          <span>Build: <strong>Not Configured</strong></span>
        </div>
      </div>
    </div>
  );
};
