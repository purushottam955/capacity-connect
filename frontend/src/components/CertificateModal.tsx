import React from 'react';
import { X, Printer, Award, ShieldCheck } from 'lucide-react';
import { Certificate } from '../types';

interface CertificateModalProps {
  certificate: Certificate | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, onClose }) => {
  if (!certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(certificate.issued_at).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  let parsedMetadata: any = {};
  try {
    if (certificate.metadata_json) {
      parsedMetadata = JSON.parse(certificate.metadata_json);
    }
  } catch {
    // Ignore JSON error
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-semibold tracking-wide">VERIFIED DIGITAL CERTIFICATE</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-institutional-600 hover:bg-institutional-700 text-xs font-medium rounded-md transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Body (Optimized for Screen & Print) */}
        <div id="printable-certificate" className="p-8 sm:p-12 bg-[#FDFCF7] text-slate-800 relative border-8 border-double border-slate-300 m-2">
          {/* Subtle Watermark Emblem Background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-4 pointer-events-none">
            <div className="w-96 h-96 rounded-full border-12 border-slate-900 flex items-center justify-center">
              <span className="text-8xl font-serif font-black text-slate-900">IMD</span>
            </div>
          </div>

          <div className="relative z-10 text-center space-y-6">
            {/* Header */}
            <div className="space-y-1 border-b border-slate-200 pb-4">
              <p className="text-xs font-bold tracking-widest text-institutional-900 uppercase">
                GOVERNMENT OF INDIA • MINISTRY OF EARTH SCIENCES
              </p>
              <h4 className="text-sm font-serif font-semibold text-slate-700 uppercase tracking-wider">
                India Meteorological Department
              </h4>
              <div className="pt-2">
                <span className="inline-block px-3 py-0.5 text-[11px] font-mono tracking-widest uppercase bg-amber-100 text-amber-900 rounded-sm border border-amber-300">
                  CAPACITY CONNECT • DIGITAL CAPACITY BUILDING PORTAL
                </span>
              </div>
            </div>

            {/* Title */}
            <div className="py-2">
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
                Certificate of Competency
              </h1>
              <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">
                Ref: {certificate.certificate_code}
              </p>
            </div>

            {/* Recipient */}
            <div className="space-y-2">
              <p className="text-sm text-slate-600 italic font-serif">This is to certify that</p>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-institutional-900 border-b-2 border-slate-300 inline-block px-8 pb-1">
                {certificate.user_name}
              </h2>
              <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed pt-2">
                has successfully completed the accredited institutional competency curriculum and rigorous assessment requirements for
              </p>
            </div>

            {/* Course Title */}
            <div className="py-2">
              <div className="text-lg sm:text-xl font-bold text-slate-900 bg-slate-100/80 py-2.5 px-6 rounded-md inline-block border border-slate-200">
                {certificate.course_title}
              </div>
            </div>

            {/* Metadata and Competency Gained */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-left py-2 border-y border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">Validated Competency:</span>
                <span className="font-semibold text-slate-800">{parsedMetadata.competency || 'Atmospheric Science'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Assessment Score:</span>
                <span className="font-semibold text-emerald-700">{parsedMetadata.score ? `${parsedMetadata.score}% (Qualified)` : 'Qualified (≥70%)'}</span>
              </div>
            </div>

            {/* Signatures & Seal */}
            <div className="pt-8 flex items-end justify-between px-4 sm:px-12 text-center text-xs">
              <div className="space-y-1">
                <div className="w-36 border-b border-slate-400 pb-1 font-serif italic text-slate-700 font-semibold">
                  Dr. K. V. Ramanathan
                </div>
                <p className="text-[10px] text-slate-500 uppercase font-medium">
                  Director of Training & Capacity<br />MoES / IMD Central HQ
                </p>
              </div>

              {/* Digital Seal */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border-2 border-amber-600/60 bg-amber-50/50 flex flex-col items-center justify-center p-1 text-center shadow-xs">
                  <ShieldCheck className="w-6 h-6 text-amber-700" />
                  <span className="text-[8px] font-bold text-amber-900 tracking-tighter uppercase">VERIFIED</span>
                </div>
                <span className="text-[9px] text-slate-400 font-mono mt-1">{formattedDate}</span>
              </div>

              <div className="space-y-1">
                <div className="w-36 border-b border-slate-400 pb-1 font-serif italic text-slate-700 font-semibold">
                  Prof. Ananya Sen
                </div>
                <p className="text-[10px] text-slate-500 uppercase font-medium">
                  Lead Master Trainer<br />NWP Modeling Division
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 print:hidden">
          <span>Official Digital Credential • Tamper-evident repository</span>
          <span className="font-mono">ID: {certificate.certificate_code}</span>
        </div>
      </div>
    </div>
  );
};
