import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, AlertCircle, CheckCircle2, Building2, PlayCircle } from 'lucide-react';
import { companyService } from '../../services/companyService';

export const WorkLocationSetupModal = ({ internship, companyUserId, isOpen, onClose, onSetupComplete }) => {
  const [formData, setFormData] = useState({
    work_location: '',
    address: '',
    latitude: '',
    longitude: '',
    allowed_radius_km: '0.5',
  });

  const [loading, setLoading] = useState(false);
  const [activating, setActivating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (internship) {
      setFormData({
        work_location: internship.work_location || '',
        address: internship.address || '',
        latitude: internship.latitude !== null && internship.latitude !== undefined ? String(internship.latitude) : '',
        longitude: internship.longitude !== null && internship.longitude !== undefined ? String(internship.longitude) : '',
        allowed_radius_km: internship.allowed_radius_km ? String(internship.allowed_radius_km) : '0.5',
      });
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [internship, isOpen]);

  if (!isOpen || !internship) return null;

  const handleGetCurrentGps = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Browser Geolocation API is not supported.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: String(pos.coords.latitude),
          longitude: String(pos.coords.longitude),
        }));
        setSuccessMsg('Captured current device GPS coordinates!');
      },
      (err) => {
        setErrorMsg('Failed to capture GPS coordinates. Please enter manually.');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.work_location || !formData.latitude || !formData.longitude) {
      setErrorMsg('Location title, Latitude, and Longitude are required.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');

      await companyService.setupWorkLocation(companyUserId, internship.id, formData);

      setSuccessMsg('Work location & geofence configured successfully!');
      setTimeout(() => {
        if (onSetupComplete) onSetupComplete();
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save work location.');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    try {
      setActivating(true);
      setErrorMsg('');
      setSuccessMsg('');

      await companyService.activateInternship(internship.id, companyUserId);

      setSuccessMsg('Internship Activated Successfully! Status updated to ACTIVE.');
      setTimeout(() => {
        onClose();
        if (onSetupComplete) onSetupComplete();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to activate internship.');
    } finally {
      setActivating(false);
    }
  };

  const canActivate = internship.status === 'FACULTY_ASSIGNED' && internship.faculty_id && (formData.latitude || internship.latitude);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-[#E1E7E2]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F0F4F1] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#18201B]">Configure Work Location & Geofence</h3>
              <p className="text-xs text-[#66706A]">Company Attendance Setup Panel</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#66706A] hover:text-[#18201B] font-bold text-lg">×</button>
        </div>

        {/* Feedback Banners */}
        {errorMsg && (
          <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] p-3 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-[#EAF4EC] border border-[#C5E3CC] text-[#1F6B32] p-3 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2F8F46] shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#18201B] mb-1">Work Location Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. TechCorp HQ - Nagpur Branch"
              value={formData.work_location}
              onChange={(e) => setFormData({ ...formData, work_location: e.target.value })}
              className="w-full px-3 py-2 border border-[#E1E7E2] rounded-lg text-xs font-medium focus:outline-none focus:border-[#2F8F46]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#18201B] mb-1">Full Physical Address</label>
            <input
              type="text"
              placeholder="e.g. Plot 12, IT Park, Parsodi, Nagpur, MH 440022"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-[#E1E7E2] rounded-lg text-xs font-medium focus:outline-none focus:border-[#2F8F46]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#18201B] mb-1">Latitude (GPS) *</label>
              <input
                type="number"
                step="any"
                required
                placeholder="21.123456"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                className="w-full px-3 py-2 border border-[#E1E7E2] rounded-lg text-xs font-mono focus:outline-none focus:border-[#2F8F46]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#18201B] mb-1">Longitude (GPS) *</label>
              <input
                type="number"
                step="any"
                required
                placeholder="79.054321"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                className="w-full px-3 py-2 border border-[#E1E7E2] rounded-lg text-xs font-mono focus:outline-none focus:border-[#2F8F46]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleGetCurrentGps}
              className="text-[11px] font-bold text-[#2F8F46] hover:underline flex items-center gap-1"
            >
              <Navigation className="w-3 h-3" />
              <span>Use My Device Current GPS Coords</span>
            </button>

            <div className="w-48 text-right">
              <label className="block font-bold text-[#18201B] mb-1">Radius (Km)</label>
              <input
                type="number"
                step="0.1"
                placeholder="0.5 (500m)"
                value={formData.allowed_radius_km}
                onChange={(e) => setFormData({ ...formData, allowed_radius_km: e.target.value })}
                className="w-full px-3 py-1.5 border border-[#E1E7E2] rounded-lg text-xs font-medium text-right focus:outline-none focus:border-[#2F8F46]"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-[#F0F4F1]">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-[#18201B] hover:bg-[#2C3530] text-white text-xs font-bold transition-all"
            >
              {loading ? 'Saving Location...' : 'Save Geofence Setup'}
            </button>

            {internship.status === 'FACULTY_ASSIGNED' && (
              <button
                type="button"
                onClick={handleActivate}
                disabled={activating || !canActivate}
                className="px-4 py-2 rounded-lg bg-[#2F8F46] hover:bg-[#1F6B32] text-white text-xs font-bold disabled:bg-[#9CA3AF] transition-all flex items-center gap-1.5 shadow-xs"
              >
                <PlayCircle className="w-4 h-4" />
                <span>{activating ? 'Activating...' : 'Activate Internship (Status -> ACTIVE)'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
