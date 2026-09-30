import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Certificate } from '../../types';
import { Award, ShieldCheck, Printer, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { CertificateModal } from '../../components/CertificateModal';

export const TraineeCertificates: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  useEffect(() => {
    api.get<Certificate[]>('/trainee/certificates')
      .then((data) => {
        setCertificates(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-institutional-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <Award className="w-6 h-6 text-institutional-600" />
          Verified Competency Certificates
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Official tamper-evident credentials issued by Ministry of Earth Sciences / India Meteorological Department.
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="p-12 bg-white rounded-xl border border-slate-200 text-center space-y-3">
          <Award className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No certificates earned yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Complete a course module and pass the competency assessment (≥70%) to automatically earn a digital certificate.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-sm bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                    {cert.certificate_code}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{cert.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{cert.course_title}</p>
                </div>

                <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                  <div>Issued To: <strong>{cert.user_name}</strong></div>
                  <div>Issuing Authority: <strong>{cert.issuing_org}</strong></div>
                  <div>Date: <strong>{new Date(cert.issued_at).toLocaleDateString()}</strong></div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Accredited Digital Credential</span>
                <button
                  onClick={() => setSelectedCert(cert)}
                  className="px-3.5 py-1.5 bg-institutional-900 hover:bg-institutional-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  View & Print Certificate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCert && (
        <CertificateModal
          certificate={selectedCert}
          onClose={() => setSelectedCert(null)}
        />
      )}
    </div>
  );
};
