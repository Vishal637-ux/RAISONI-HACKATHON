import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, CheckCircle2, AlertCircle, Clock, ShieldAlert, Compass } from 'lucide-react';
import { attendanceService } from '../../services/attendanceService';
import { calculateHaversineDistance } from '../../utils/haversine';

export const AttendanceMarker = ({ internship, onAttendanceMarked }) => {
  const [locating, setLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [todayLog, setTodayLog] = useState(null);
  const [currentCoords, setCurrentCoords] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);

  // Load company-configured work hours + today's checkout from localStorage
  const workHours = internship?.id
    ? JSON.parse(localStorage.getItem(`work_hours_${internship.id}`) || 'null')
    : null;

  const todayKey = `checkout_${internship?.id}_${new Date().toISOString().split('T')[0]}`;

  useEffect(() => {
    const savedCheckout = localStorage.getItem(todayKey);
    if (savedCheckout) setCheckOutTime(savedCheckout);
  }, [todayKey]);

  useEffect(() => {
    async function checkTodayAttendance() {
      if (!internship) return;
      try {
        const logs = await attendanceService.getStudentAttendance(internship.student_id);
        const todayDate = new Date().toISOString().split('T')[0];
        const logForToday = logs.find((l) => l.attendance_date === todayDate);
        if (logForToday) {
          setTodayLog(logForToday);
        }
      } catch (err) {
        console.error('Error checking today attendance:', err);
      }
    }

    checkTodayAttendance();
  }, [internship]);

  if (!internship) return null;

  const isActive = internship.status === 'ACTIVE';
  const hasWorkLocation = internship.latitude !== null && internship.longitude !== null;

  const handleMarkAttendance = () => {
    if (!isActive) {
      setErrorMsg('Internship is not ACTIVE yet. Attendance is disabled.');
      return;
    }

    if (!hasWorkLocation) {
      setErrorMsg('Company has not configured work location coordinates yet.');
      return;
    }

    if (!navigator.geolocation) {
      setErrorMsg('Browser Geolocation API is not supported by your device.');
      return;
    }

    setLocating(true);
    setErrorMsg('');
    setSuccessMsg('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        setCurrentCoords(coords);

        try {
          const log = await attendanceService.markGPSAttendance(
            internship.student_id,
            internship.id,
            coords
          );

          setTodayLog(log);
          setSuccessMsg(
            log.geofence_status === 'VERIFIED_GEOFENCE'
              ? `Check-in Verified! Distance to site: ${log.distance_meters}m.`
              : `Check-in recorded, but flagged OUT OF BOUNDS (${log.distance_meters}m from site).`
          );

          if (onAttendanceMarked) onAttendanceMarked();
        } catch (err) {
          setErrorMsg(err.message || 'Failed to record GPS attendance.');
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        setLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMsg('GPS Permission Denied. Please enable location access in browser settings.');
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMsg('Location unavailable. Check device GPS signal.');
            break;
          case error.TIMEOUT:
            setErrorMsg('GPS Location request timed out. Please try again.');
            break;
          default:
            setErrorMsg('An unknown error occurred while requesting GPS location.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center font-bold">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#18201B]">Daily GPS Attendance Engine</h3>
            <p className="text-xs text-[#66706A]">Single Source of Truth Geofenced Verification</p>
          </div>
        </div>

        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
          isActive ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#C5E3CC]' : 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]'
        }`}>
          {isActive ? 'ACTIVE INTERNSHIP' : 'PRE-ACTIVE STAGE'}
        </span>
      </div>

      {/* Geofence Site Information */}
      <div className="bg-[#F8FAF9] p-3.5 rounded-lg border border-[#E1E7E2] text-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[#66706A]">Assigned Site Location:</span>
          <span className="font-bold text-[#18201B]">{internship.work_location || 'Office Location'}</span>
        </div>
        <div className="flex items-center justify-between text-[#66706A]">
          <span>Geofence Coordinates:</span>
          <span className="font-mono text-[#18201B]">
            {hasWorkLocation ? `${internship.latitude}, ${internship.longitude}` : 'Not Configured'}
          </span>
        </div>
        <div className="flex items-center justify-between text-[#66706A]">
          <span>Allowed Radius:</span>
          <span className="font-bold text-[#2F8F46]">
            {(internship.allowed_radius_km || 0.5) * 1000} meters ({(internship.allowed_radius_km || 0.5)} km)
          </span>
        </div>
        {workHours && (
          <div className="flex items-center justify-between text-[#66706A] border-t border-[#E1E7E2] pt-1.5 mt-1">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Expected Hours:</span>
            <span className="font-bold text-[#18201B]">{workHours.check_in_time} – {workHours.check_out_time}</span>
          </div>
        )}
      </div>

      {/* Feedback Messages */}
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

      {/* Today's Log Card */}
      {todayLog ? (
        <div className={`p-4 rounded-xl border space-y-3 text-xs ${
          todayLog.geofence_status === 'VERIFIED_GEOFENCE'
            ? 'bg-[#EAF4EC] border-[#C5E3CC] text-[#1F6B32]'
            : 'bg-[#FEF3C7] border-[#FDE68A] text-[#D97706]'
        }`}>
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5">
              {todayLog.geofence_status === 'VERIFIED_GEOFENCE' ? (
                <CheckCircle2 className="w-4 h-4 text-[#2F8F46]" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-[#D97706]" />
              )}
              Today's Attendance Checked In
            </span>
            <span>{todayLog.attendance_date}</span>
          </div>

          {/* Check-in / Check-out Time Row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/60 rounded-lg p-2 text-center">
              <div className="text-[10px] font-semibold text-[#66706A] mb-0.5">Check-In Time</div>
              <div className="font-bold text-[#1F6B32] flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(todayLog.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </div>
            </div>
            <div className="bg-white/60 rounded-lg p-2 text-center">
              <div className="text-[10px] font-semibold text-[#66706A] mb-0.5">Check-Out Time</div>
              {checkOutTime ? (
                <div className="font-bold text-[#1F6B32] flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  {checkOutTime}
                </div>
              ) : (
                <button
                  onClick={() => {
                    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
                    localStorage.setItem(todayKey, now);
                    setCheckOutTime(now);
                  }}
                  className="text-[11px] font-bold bg-[#2F8F46] hover:bg-[#1F6B32] text-white px-2 py-1 rounded-md transition-colors"
                >
                  Check Out
                </button>
              )}
            </div>
          </div>

          <p className="text-[11px]">
            Geofence Verdict: <strong className="uppercase">{todayLog.geofence_status}</strong> • Distance from site:{' '}
            <strong>{todayLog.distance_meters} meters</strong>
          </p>
          <div className="text-[10px] opacity-75 font-mono">
            GPS: {todayLog.latitude}, {todayLog.longitude} (Accuracy: {todayLog.accuracy}m)
          </div>
        </div>
      ) : (
        <div className="pt-2">
          <button
            onClick={handleMarkAttendance}
            disabled={locating || !isActive || !hasWorkLocation}
            className="w-full py-3 px-4 rounded-xl bg-[#2F8F46] hover:bg-[#1F6B32] text-white text-sm font-bold disabled:bg-[#9CA3AF] transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <Navigation className="w-4 h-4" />
            <span>{locating ? 'Requesting Device GPS Location...' : 'Mark Daily Attendance (GPS Check-In)'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
