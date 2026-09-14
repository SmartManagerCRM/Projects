import { Link } from "react-router-dom";
import logoMark from "../../assets/logoMark.js";

export default function AuthLayout({ children, wide = false }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-navy-950 p-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl" />
        <Link to="/" className="relative flex items-center gap-2.5">
          <div dangerouslySetInnerHTML={{ __html: logoMark }} className="h-10 w-10" />
          <div>
            <p className="text-sm font-extrabold">SmartManager</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gold-400">Projects</p>
          </div>
        </Link>
        <div className="relative">
          <p className="text-3xl font-extrabold leading-tight">
            Plan Smarter.
            <br />
            Manage Better.
            <br />
            <span className="text-gold-400">Build with Confidence.</span>
          </p>
          <p className="mt-4 max-w-sm text-sm text-white/60">
            Intelligent project management, construction controls and business automation for contractors, engineers
            and real-estate developers.
          </p>
        </div>
        <div className="relative flex items-center gap-8 text-xs text-white/40">
          <span>© {new Date().getFullYear()} SmartManager Projects</span>
        </div>
      </div>

      <div className="flex items-center justify-center bg-ink-50 px-5 py-12 lg:bg-white">
        <div className={`w-full ${wide ? "max-w-lg" : "max-w-md"}`}>
          <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div dangerouslySetInnerHTML={{ __html: logoMark }} className="h-9 w-9" />
            <div>
              <p className="text-sm font-extrabold text-navy-950">SmartManager</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gold-600">Projects</p>
            </div>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
