import React, { useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import {
  X,
  Building2,
  Mail,
  Phone,
  User,
  Briefcase,
  Award,
  FileCheck2,
  Calendar,
  CheckCircle2,
  History,
  ShieldCheck,
  ExternalLink,
  MapPin,
} from 'lucide-react';

export const TPOCompanyDetailsModal = ({ isOpen, onClose, company }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !company) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tpo-company-modal-title"
    >
      <Card className="bg-white border border-[#E9DDFE] max-w-2xl w-full p-6 rounded-2xl shadow-2xl space-y-5 animate-in fade-in duration-200 my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] flex items-center justify-center font-bold text-lg">
              {company.logoUrl ? (
                <img src={company.logoUrl} alt={company.name} className="w-10 h-10 object-contain rounded-lg" />
              ) : (
                company.initials || 'CP'
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="tpo-company-modal-title" className="text-base font-bold text-[#171717]">
                  {company.name}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {company.mouStatus || 'Verified Partner'}
                </span>
              </div>
              <p className="text-xs text-[#6B7280] flex items-center gap-1.5 mt-0.5">
                <span>{company.industry}</span> • 
                <span className="flex items-center gap-0.5"><MapPin size={12} /> {company.location}</span>
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

        {/* HR Contact & MoU Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* HR Contact Details */}
          <div className="p-3.5 rounded-xl border border-[#E9DDFE] bg-[#F3EDFF]/20 space-y-2">
            <span className="font-bold text-[#171717] flex items-center gap-1.5">
              <User size={15} className="text-[#A874F7]" />
              <span>Corporate HR Contact Details</span>
            </span>
            <div className="space-y-1 text-[11px] text-[#6B7280]">
              <p className="font-bold text-[#171717]">{company.hrContactName || 'Rajesh Malhotra'}</p>
              <p className="flex items-center gap-1.5">
                <Mail size={12} className="text-[#A874F7]" />
                <span>{company.hrEmail}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Phone size={12} className="text-[#A874F7]" />
                <span>{company.hrPhone}</span>
              </p>
            </div>
          </div>

          {/* Active MoU Status */}
          <div className="p-3.5 rounded-xl border border-[#E9DDFE] bg-[#F3EDFF]/20 space-y-2">
            <span className="font-bold text-[#171717] flex items-center gap-1.5">
              <FileCheck2 size={15} className="text-[#A874F7]" />
              <span>Institutional MoU Agreement</span>
            </span>
            <div className="space-y-1 text-[11px] text-[#6B7280]">
              <p className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                {company.mouStatus}
              </p>
              <p>Signed: <strong>{company.mouSignedDate || '2025-06-15'}</strong></p>
              <p>Valid Until: <strong>{company.mouExpiryDate || '2028-06-15'}</strong></p>
            </div>
          </div>
        </div>

        {/* Placement Metrics Summary Cards */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/50">
            <span className="text-[#6B7280] text-[10px] block">Active Offers</span>
            <span className="font-extrabold text-blue-700 text-sm">{company.activeOffersCount || 24}</span>
          </div>
          <div className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/50">
            <span className="text-[#6B7280] text-[10px] block">Total Interns</span>
            <span className="font-extrabold text-[#A874F7] text-sm">{company.totalInternsCount || 45}</span>
          </div>
          <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
            <span className="text-[#6B7280] text-[10px] block">Placements Completed</span>
            <span className="font-extrabold text-emerald-700 text-sm">{company.totalPlacementsCount || 38}</span>
          </div>
        </div>

        {/* Active Internship Drive Listings */}
        <div className="space-y-2 text-xs">
          <span className="font-bold text-[#171717] flex items-center gap-1.5">
            <Briefcase size={15} className="text-[#A874F7]" />
            <span>Active Corporate Internship Drive Listings</span>
          </span>
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {(company.activeListings || []).map((listing, idx) => (
              <div key={idx} className="p-2.5 rounded-lg border border-[#E9DDFE] bg-white flex items-center justify-between text-[11px]">
                <div>
                  <p className="font-bold text-[#171717]">{listing.title}</p>
                  <p className="text-[10px] text-[#6B7280]">Stipend: <strong className="text-emerald-700">{listing.stipend}</strong></p>
                </div>
                <span className="px-2 py-0.5 rounded bg-purple-50 text-[#A874F7] border border-[#E9DDFE] font-bold">
                  {listing.openings} Openings
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Requirement #7: Recruitment Timeline */}
        <div className="p-3 rounded-xl border border-[#E9DDFE] bg-gray-50/70 space-y-1.5 text-xs">
          <span className="font-bold text-[#171717] block">Recruitment & Placement Timeline (Read-Only):</span>
          <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] pt-0.5">
            {(company.recruitmentTimeline || [
              { stage: 'Company Onboarded', date: '2025-06-15' },
              { stage: 'MoU Signed', date: '2025-06-15' },
              { stage: 'Internships Posted', date: '2026-01-10' },
              { stage: 'Students Selected', date: '2026-02-15' },
              { stage: 'Placements Completed', date: '2026-07-28' },
            ]).map((t, idx, arr) => (
              <React.Fragment key={idx}>
                <div className="px-2 py-1 rounded bg-white border border-[#E9DDFE] text-center shrink-0">
                  <span className="font-bold text-[#171717] block">{t.stage}</span>
                  <span className="text-[9px] text-[#6B7280]">{t.date}</span>
                </div>
                {idx < arr.length - 1 && <span className="text-[#6B7280] font-bold">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E9DDFE] text-xs">
          <Button type="button" variant="outline" onClick={onClose} className="text-xs px-4">
            Close
          </Button>

          <span className="text-xs text-[#6B7280] font-semibold flex items-center gap-1">
            <ShieldCheck size={14} className="text-emerald-600" />
            Verified TPO Partner Record
          </span>
        </div>
      </Card>
    </div>
  );
};
