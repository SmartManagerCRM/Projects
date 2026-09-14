import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import logoMark from "../assets/logoMark.js";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-950 px-6 text-center text-white">
      <div dangerouslySetInnerHTML={{ __html: logoMark }} className="mb-6 h-12 w-12" />
      <Compass size={30} className="mb-4 text-gold-400" />
      <p className="text-sm font-semibold uppercase tracking-widest text-white/40">404</p>
      <h1 className="mt-2 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-white/60">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="mt-6 rounded-lg bg-gold-500 px-5 py-2.5 text-sm font-bold text-navy-950 hover:bg-gold-400">
        Back to Home
      </Link>
    </div>
  );
}
