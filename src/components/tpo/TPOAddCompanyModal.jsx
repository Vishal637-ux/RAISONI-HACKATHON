import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { X, Building2, Globe, MapPin, User, Mail, Phone, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const TPOAddCompanyModal = ({ isOpen, onClose, onAddCompany }) => {
  const [formData, setFormData] = useState({
    name: '',
    industry: 'Information Technology & Software',
    website: '',
    address: '',
    hrContactName: '',
    hrEmail: '',
    hrPhone: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        industry: 'Information Technology & Software',
        website: '',
        address: '',
        hrContactName: '',
        hrEmail: '',
        hrPhone: '',
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.hrEmail.trim()) {
      toast.error('Please fill in official company name and HR email address');
      return;
    }
    setIsSubmitting(true);
    try {
      await onAddCompany(formData);
      toast.success(`Corporate Partner '${formData.name}' registered successfully`);
      onClose();
    } catch {
      toast.error('Failed to register company');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tpo-add-company-title"
    >
      <Card className="bg-white border border-[#E9DDFE] max-w-xl w-full p-6 rounded-2xl shadow-2xl space-y-5 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] flex items-center justify-center font-bold">
              <PlusCircle size={20} />
            </div>
            <div>
              <h3 id="tpo-add-company-title" className="text-base font-bold text-[#171717]">
                Register New Corporate Partner
              </h3>
              <p className="text-xs text-[#6B7280]">
                TPO Corporate Partner Onboarding Entry Form
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg border border-[#E9DDFE] text-[#6B7280] hover:text-[#171717] hover:bg-[#F3EDFF]/50 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="block font-semibold text-[#171717]">Official Company Name *</label>
            <div className="relative">
              <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. TechCorp Solutions Pvt Ltd"
                className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block font-semibold text-[#171717]">Industry Sector</label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full bg-[#F3EDFF]/40 border border-[#E9DDFE] text-[#171717] rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
              >
                <option value="Information Technology & Software">Information Technology & Software</option>
                <option value="IT Services & Consulting">IT Services & Consulting</option>
                <option value="Digital Transformation & Cloud">Digital Transformation & Cloud</option>
                <option value="Manufacturing & Core Engineering">Manufacturing & Core Engineering</option>
                <option value="Banking & Financial Services">Banking & Financial Services</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-[#171717]">Company Website URL</label>
              <div className="relative">
                <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://company.example.com"
                  className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-[#171717]">Corporate Office Location / Address</label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. Hinjewadi Phase II, Pune 411057"
                className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl border border-[#E9DDFE] bg-[#F3EDFF]/20 space-y-3">
            <span className="font-bold text-[#171717] block">Official HR Contact Details</span>

            <div className="space-y-1.5">
              <label className="block text-[11px] text-[#6B7280] font-semibold">HR Contact Person Name *</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                <input
                  type="text"
                  required
                  value={formData.hrContactName}
                  onChange={(e) => setFormData({ ...formData, hrContactName: e.target.value })}
                  placeholder="e.g. Rajesh Malhotra"
                  className="w-full bg-white border border-[#E9DDFE] text-[#171717] rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-[11px] text-[#6B7280] font-semibold">HR Official Email *</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                  <input
                    type="email"
                    required
                    value={formData.hrEmail}
                    onChange={(e) => setFormData({ ...formData, hrEmail: e.target.value })}
                    placeholder="hr@company.com"
                    className="w-full bg-white border border-[#E9DDFE] text-[#171717] rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] text-[#6B7280] font-semibold">HR Phone Number</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                  <input
                    type="tel"
                    value={formData.hrPhone}
                    onChange={(e) => setFormData({ ...formData, hrPhone: e.target.value })}
                    placeholder="+91 98230 12345"
                    className="w-full bg-white border border-[#E9DDFE] text-[#171717] rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#E9DDFE]">
            <Button type="button" variant="outline" onClick={onClose} className="text-xs px-4">
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting} className="text-xs px-6 shadow-xs bg-[#A874F7] hover:bg-[#965BEB] text-white">
              Register Corporate Partner
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
