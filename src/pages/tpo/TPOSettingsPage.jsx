import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { tpoService } from '../../services/tpoService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  ShieldCheck,
  Save,
  RefreshCw,
  Sliders,
  Bell,
  CheckCircle2,
  Lock,
  Database,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const TPOSettingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    minCgpaThreshold: '6.5',
    maxOffersPerStudent: '2',
    mouNoticeDays: '30',
    autoAuditOfferLetters: true,
    emailNotifications: true,
    academicYear: '2025-2026',
    institutionName: 'G. H. Raisoni College of Engineering',
  });

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const data = await tpoService.fetchTPOSettings();
        if (data) setSettings(data);
      } catch (err) {
        console.error('Error loading TPO settings:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await tpoService.saveTPOSettings(user?.id, settings);
      toast.success('Successfully saved TPO institutional policy settings & rules!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
      {/* Governance Banner */}
      <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900 shadow-2xs">
        <div className="flex items-center gap-2 font-bold">
          <ShieldCheck size={18} className="text-amber-700 shrink-0" />
          <span>TPO Portal Settings • Institutional Placement Policy • Audit Rules • Academic Records Read-Only</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-amber-800 font-semibold flex-wrap">
          <span className="bg-white/80 px-2 py-0.5 rounded border border-amber-200">Academic Records Read-Only</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white border border-[#E9DDFE] p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A874F7]">
              TPO Master Placement Portal
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] uppercase tracking-wider">
              Institutional Placement Policy & Governance Configurations
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#171717]">
            TPO Portal Settings & Preferences
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Configure institutional placement drive policy thresholds, MoU renewal alert windows, and automated offer letter audit rules.
          </p>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-5">
        <Card className="bg-white border border-[#E9DDFE] p-6 shadow-sm rounded-2xl space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E9DDFE] pb-3">
            <Sliders size={18} className="text-[#A874F7]" />
            <h3 className="text-base font-bold text-[#171717]">Institutional Placement Policy Rules</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#171717] mb-1">Minimum CGPA Eligibility Threshold</label>
              <input
                type="text"
                value={settings.minCgpaThreshold}
                onChange={(e) => setSettings({ ...settings, minCgpaThreshold: e.target.value })}
                className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] rounded-xl p-2.5 focus:outline-none"
              />
              <span className="text-[10px] text-[#6B7280] mt-0.5 block">Minimum CGPA required for campus drive participation.</span>
            </div>

            <div>
              <label className="block font-semibold text-[#171717] mb-1">Maximum Placement Offers Allowed per Student</label>
              <input
                type="text"
                value={settings.maxOffersPerStudent}
                onChange={(e) => setSettings({ ...settings, maxOffersPerStudent: e.target.value })}
                className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] rounded-xl p-2.5 focus:outline-none"
              />
              <span className="text-[10px] text-[#6B7280] mt-0.5 block">Institutional limit before student is marked fully placed.</span>
            </div>

            <div>
              <label className="block font-semibold text-[#171717] mb-1">MoU Expiry Advance Renewal Alert Notice (Days)</label>
              <input
                type="text"
                value={settings.mouNoticeDays}
                onChange={(e) => setSettings({ ...settings, mouNoticeDays: e.target.value })}
                className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] rounded-xl p-2.5 focus:outline-none"
              />
              <span className="text-[10px] text-[#6B7280] mt-0.5 block">Days before MoU expiration to trigger amber alert badge.</span>
            </div>

            <div>
              <label className="block font-semibold text-[#171717] mb-1">Current Academic Session Year</label>
              <input
                type="text"
                value={settings.academicYear}
                onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
                className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] rounded-xl p-2.5 focus:outline-none"
              />
              <span className="text-[10px] text-[#6B7280] mt-0.5 block">Current active academic year for reporting audits.</span>
            </div>
          </div>
        </Card>

        <Card className="bg-white border border-[#E9DDFE] p-6 shadow-sm rounded-2xl space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E9DDFE] pb-3">
            <Bell size={18} className="text-[#A874F7]" />
            <h3 className="text-base font-bold text-[#171717]">Automated Audit & Notification Governance</h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-[#E9DDFE] bg-[#F3EDFF]/20 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoAuditOfferLetters}
                onChange={(e) => setSettings({ ...settings, autoAuditOfferLetters: e.target.checked })}
                className="rounded border-[#E9DDFE] text-[#A874F7] focus:ring-[#A874F7] w-4 h-4"
              />
              <div>
                <span className="font-bold text-[#171717] block">Enable Automatic Offer Letter Discrepancy Auditing</span>
                <span className="text-[10px] text-[#6B7280]">Flag salary or joining date mismatches against MoU terms automatically.</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-[#E9DDFE] bg-[#F3EDFF]/20 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="rounded border-[#E9DDFE] text-[#A874F7] focus:ring-[#A874F7] w-4 h-4"
              />
              <div>
                <span className="font-bold text-[#171717] block">Enable Institutional Email Notifications for MoU Renewals</span>
                <span className="text-[10px] text-[#6B7280]">Send automated renewal notice emails to Corporate Partner HR leads.</span>
              </div>
            </label>
          </div>
        </Card>

        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
            className="bg-[#A874F7] hover:bg-[#965BEB] text-white text-xs px-6 py-2.5 shadow-sm"
          >
            <Save size={14} className="mr-1.5" />
            Save Institutional Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
