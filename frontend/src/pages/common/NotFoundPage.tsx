import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center mx-auto mb-4 shadow-sm shadow-indigo-100">
        TS
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
      <p className="text-base text-slate-600 mt-2 font-medium">Page Not Found</p>
      <p className="text-xs text-slate-400 mt-1 max-w-sm">
        The destination you requested does not exist or has been relocated.
      </p>
      <Link
        to="/"
        className="mt-6 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all inline-flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Homepage
      </Link>
    </div>
  );
};

