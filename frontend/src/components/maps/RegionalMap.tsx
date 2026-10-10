import React, { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import type { GroundwaterAssessmentUnit } from '../../types/api';
import { MapPinOff } from 'lucide-react';

interface RegionalMapProps {
  units: GroundwaterAssessmentUnit[];
  onSelectUnit?: (unit: GroundwaterAssessmentUnit) => void;
  selectedUnitId?: string | null;
  className?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Safe: '#15803d',
  'Semi-Critical': '#ca8a04',
  Critical: '#ea580c',
  'Over-Exploited': '#dc2626',
  Saline: '#9333ea',
};

export const RegionalMap: React.FC<RegionalMapProps> = ({
  units,
  onSelectUnit,
  selectedUnitId,
  className = '',
}) => {
  // Check if valid coordinates exist in the units
  const unitsWithCoords = useMemo(() => {
    return units.filter(
      (u) =>
        u.latitude !== undefined &&
        u.latitude !== null &&
        !isNaN(Number(u.latitude)) &&
        u.longitude !== undefined &&
        u.longitude !== null &&
        !isNaN(Number(u.longitude))
    );
  }, [units]);

  if (unitsWithCoords.length === 0) {
    return (
      <div
        className={`p-10 rounded-xl bg-stone-50 border border-stone-200 flex flex-col items-center justify-center text-center ${className}`}
      >
        <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center text-[#66736A] mb-3">
          <MapPinOff className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-[#17211B]">Map Coordinate Geometry Unavailable</h4>
        <p className="text-xs text-[#66736A] mt-1 max-w-md">
          The official groundwater dataset returned by the API does not supply geographic latitude/longitude coordinates or boundary shapefiles for these assessment units.
        </p>
        <span className="mt-3 text-[11px] font-medium text-[#0F766E] bg-emerald-50 px-3 py-1 rounded border border-emerald-200">
          Strict scientific adherence: Coordinates are never fabricated. Tabular exploration enabled.
        </span>
      </div>
    );
  }

  // Calculate center from coordinates
  const centerLat = unitsWithCoords.reduce((acc, u) => acc + Number(u.latitude), 0) / unitsWithCoords.length;
  const centerLng = unitsWithCoords.reduce((acc, u) => acc + Number(u.longitude), 0) / unitsWithCoords.length;

  return (
    <div className={`relative rounded-xl overflow-hidden border border-[#E1E8E1] h-[450px] ${className}`}>
      <MapContainer
        center={[centerLat || 20.5937, centerLng || 78.9629]}
        zoom={6}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {unitsWithCoords.map((unit) => {
          const color = CATEGORY_COLORS[unit.category] || '#64748b';
          const isSelected = selectedUnitId === unit.assessment_unit_id;

          return (
            <CircleMarker
              key={unit.assessment_unit_id}
              center={[Number(unit.latitude), Number(unit.longitude)]}
              radius={isSelected ? 10 : 7}
              pathOptions={{
                color: isSelected ? '#000000' : color,
                fillColor: color,
                fillOpacity: 0.85,
                weight: isSelected ? 3 : 1.5,
              }}
              eventHandlers={{
                click: () => onSelectUnit && onSelectUnit(unit),
              }}
            >
              <Tooltip direction="top" offset={[0, -5]} opacity={1}>
                <div className="text-xs font-sans">
                  <strong>{unit.assessment_unit_id}</strong> ({unit.district}, {unit.state})
                  <div className="text-[11px] text-slate-600">Category: {unit.category}</div>
                </div>
              </Tooltip>
              <Popup>
                <div className="text-xs font-sans p-1">
                  <h4 className="font-bold text-sm text-slate-900">{unit.assessment_unit_id}</h4>
                  <div className="mt-1 space-y-0.5 text-slate-700">
                    <p>State: {unit.state}</p>
                    <p>District: {unit.district}</p>
                    <p>Category: <strong>{unit.category}</strong></p>
                    <p>Assessment Year: {unit.year}</p>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Map Category Legend */}
      <div className="absolute bottom-4 right-4 z-[400] bg-white/95 backdrop-blur-xs p-3 rounded-lg border border-[#E1E8E1] shadow-md text-xs">
        <h5 className="font-bold text-[#17211B] mb-2 text-[11px] uppercase tracking-wider">Groundwater Category</h5>
        <div className="space-y-1.5">
          {Object.entries(CATEGORY_COLORS).map(([cat, col]) => (
            <div key={cat} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: col }} />
              <span className="text-slate-800 text-[11px]">{cat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
