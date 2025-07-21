import React from 'react';
import { Building2, ChevronDown } from 'lucide-react';
import { useBuilding } from '../../contexts/BuildingContext';
import Card from '../ui/Card';

interface BuildingSelectorProps {
  className?: string;
  compact?: boolean;
  showLabel?: boolean;
}

const BuildingSelector: React.FC<BuildingSelectorProps> = ({ 
  className = '', 
  compact = false,
  showLabel = true 
}) => {
  const {
    buildings,
    selectedBuildingId,
    selectedBuilding,
    isLoadingBuildings,
    setSelectedBuildingId,
    isManagementCompany
  } = useBuilding();

  // Don't render for non-management users
  if (!isManagementCompany) {
    return null;
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {showLabel && (
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Building2 size={16} className="text-primary-600" />
            Building:
          </div>
        )}
        <div className="min-w-[200px]">
          {isLoadingBuildings ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
              Loading...
            </div>
          ) : buildings.length === 0 ? (
            <div className="text-sm text-gray-500">
              <a href="/management/building-setup" className="text-primary-600 hover:underline">
                Add a building
              </a>
            </div>
          ) : (
            <div className="relative">
              <select
                value={selectedBuildingId || ''}
                onChange={(e) => setSelectedBuildingId(e.target.value || null)}
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
              >
                <option value="">Select building...</option>
                {buildings.map((building) => (
                  <option key={building.id} value={building.id}>
                    {building.name}
                  </option>
                ))}
              </select>
              <ChevronDown 
                size={16} 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" 
              />
            </div>
          )}
        </div>
        {selectedBuilding && (
          <div className="text-xs text-gray-500 max-w-[200px] truncate">
            {selectedBuilding.address}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Building2 size={20} className="text-primary-600" />
          <label className="text-sm font-medium text-gray-700">
            Select Building:
          </label>
        </div>
        
        <div className="flex-1 max-w-md">
          {isLoadingBuildings ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
              Loading buildings...
            </div>
          ) : buildings.length === 0 ? (
            <div className="text-sm text-gray-500">
              No buildings found. <a href="/management/building-setup" className="text-primary-600 hover:underline">Add a building</a> to get started.
            </div>
          ) : (
            <select
              value={selectedBuildingId || ''}
              onChange={(e) => setSelectedBuildingId(e.target.value || null)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
            >
              <option value="">Select a building...</option>
              {buildings.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name} - {building.address}
                </option>
              ))}
            </select>
          )}
        </div>
        
        {selectedBuilding && (
          <div className="text-sm text-gray-500">
            <div className="font-medium">{selectedBuilding.name}</div>
            <div className="text-xs">{selectedBuilding.address}</div>
            {selectedBuilding.total_units && (
              <div className="text-xs">{selectedBuilding.total_units} units</div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default BuildingSelector;
