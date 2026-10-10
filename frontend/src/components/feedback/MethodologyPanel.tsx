import { Droplets, ShieldAlert, Award } from 'lucide-react';

export const MethodologyPanel: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Environmental Water Footprint Components */}
      <div className="bg-white rounded-xl border border-[#E1E8E1] p-6 shadow-xs">
        <h3 className="text-base font-bold text-[#17211B] flex items-center gap-2 mb-4">
          <Droplets className="w-5 h-5 text-[#0F766E]" />
          Understanding Agricultural Water Footprint Components
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
              <h4 className="text-sm font-semibold text-emerald-900">Green Water Footprint</h4>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Volume of <strong>rainwater</strong> consumed during the crop growth period that was stored in the soil root zone (green water resources) and subsequently evaporated or transpired.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-sky-600 inline-block" />
              <h4 className="text-sm font-semibold text-sky-900">Blue Water Footprint</h4>
            </div>
            <p className="text-xs text-sky-800 leading-relaxed">
              Volume of surface and <strong>groundwater</strong> consumed (evaporated, incorporated into biomass, or transferred) as a result of artificial irrigation. This directly impacts regional aquifer stress.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-300">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-slate-500 inline-block" />
              <h4 className="text-sm font-semibold text-slate-800">Grey Water Footprint</h4>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              An indicator of freshwater pollution: the volume of water required to assimilate the pollutant load (fertilizers, agrochemicals) based on natural ambient water quality standards.
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <span>
            <strong>Critical Distinction:</strong> Grey water represents a pollution-assimilation volume, not physical water abstracted or consumed. Consequently, green, blue, and grey water components have divergent hydrological implications and must not be simply conflated without clear component distinction.
          </span>
        </div>
      </div>

      {/* Scientific Data Provenance Taxonomy */}
      <div className="bg-white rounded-xl border border-[#E1E8E1] p-6 shadow-xs">
        <h3 className="text-base font-bold text-[#17211B] flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-[#14532D]" />
          Scientific Provenance Framework
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-lg border border-blue-200 bg-blue-50/40">
            <span className="font-bold text-blue-900 uppercase block mb-1 tracking-wider text-[11px]">Observed</span>
            <p className="text-blue-800">
              Direct primary observations reported by official government statistical bodies (e.g. Ministry of Commerce trade volumes, CGWB categorization logs).
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/40">
            <span className="font-bold text-emerald-900 uppercase block mb-1 tracking-wider text-[11px]">Published</span>
            <p className="text-emerald-800">
              Peer-reviewed scientific coefficients derived from established environmental literature (e.g. Mekonnen and Hoekstra 2011 water intensities).
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-purple-200 bg-purple-50/40">
            <span className="font-bold text-purple-900 uppercase block mb-1 tracking-wider text-[11px]">Inferred</span>
            <p className="text-purple-800">
              Deterministic calculations derived by combining observed volumes with published intensity factors according to explicit mathematical equations.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/40">
            <span className="font-bold text-amber-900 uppercase block mb-1 tracking-wider text-[11px]">Simulated / Optimized</span>
            <p className="text-amber-800">
              Hypothetical scenarios or mathematical optimization outputs (e.g. Scipy linear program allocations) evaluated under user-defined constraints.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
