import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Job {
  id: number;
  title: string;
  company: string;
  salary: string;
  distance: string;
  type: string;
  time: string;
  badges: string[];
  description: string;
  lat: number;
  lng: number;
}

interface JobMapProps {
  jobs: Job[];
  onJobClick?: (jobId: number) => void;
  userLocation?: [number, number] | null;
}

const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%);
        width: 40px;
        height: 40px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="transform: rotate(45deg); color: white; font-weight: bold; font-size: 16px;">₽</div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

const createUserIcon = () => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 4px solid white;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3), 0 4px 12px rgba(0,0,0,0.3);
        animation: pulse 2s infinite;
      ">
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  
  return null;
};

const JobMap = ({ jobs, onJobClick, userLocation }: JobMapProps) => {
  const center: [number, number] = userLocation || [55.7558, 37.6173];

  const getMarkerColor = (type: string) => {
    const colors: { [key: string]: string } = {
      delivery: '#8B5CF6',
      promo: '#D946EF',
      driving: '#F97316',
      warehouse: '#0EA5E9',
      service: '#10B981',
      retail: '#EC4899',
    };
    return colors[type] || '#8B5CF6';
  };

  return (
    <div className="relative w-full h-full">
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.8;
              transform: scale(1.1);
            }
          }
        `}
      </style>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
        zoomControl={true}
      >
        <MapUpdater center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {userLocation && (
          <>
            <Marker
              position={userLocation}
              icon={createUserIcon()}
            >
              <Popup>
                <div className="text-center p-2">
                  <p className="font-semibold text-blue-600">Вы здесь</p>
                  <p className="text-xs text-muted-foreground mt-1">Ваше текущее местоположение</p>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={userLocation}
              radius={100}
              pathOptions={{
                color: '#3B82F6',
                fillColor: '#3B82F6',
                fillOpacity: 0.1,
                weight: 2,
              }}
            />
          </>
        )}
        
        {jobs.map((job) => (
          <Marker
            key={job.id}
            position={[job.lat, job.lng]}
            icon={createCustomIcon(getMarkerColor(job.type))}
          >
            <Popup className="custom-popup" minWidth={280}>
              <div className="p-2">
                <div className="flex items-start gap-3 mb-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                    style={{ 
                      background: `linear-gradient(135deg, ${getMarkerColor(job.type)}, ${getMarkerColor(job.type)}dd)` 
                    }}
                  >
                    {job.title[0]}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-lg leading-tight">{job.title}</h3>
                    <p className="text-sm text-muted-foreground">{job.company}</p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <Icon name="DollarSign" size={16} />
                    {job.salary}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon name="MapPin" size={14} />
                    {job.distance}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon name="Clock" size={14} />
                    {job.time}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {job.badges.map((badge) => (
                    <Badge 
                      key={badge} 
                      className="text-xs"
                      style={{ 
                        background: getMarkerColor(job.type),
                        color: 'white'
                      }}
                    >
                      {badge}
                    </Badge>
                  ))}
                </div>

                <Button 
                  className="w-full" 
                  size="sm"
                  onClick={() => onJobClick?.(job.id)}
                >
                  Откликнуться
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default JobMap;