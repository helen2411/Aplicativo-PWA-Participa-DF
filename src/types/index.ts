export interface GPSLocation {
  lat: number;
  lng: number;
  source: 'geolocation' | 'exif' | 'manual';
}

export interface ManifestRecord {
  protocol: string;
  when: string;
  isAnonymous: boolean;
  title: string;
  text: string;
  audioUrl: string | null;
  audioDescription: string;
  imagesCount: number;
  imageDescription: string;
  videosCount: number;
  videoDescription: string;
  location: GPSLocation | null;
  address: string | null;
  // Fields for full data storage (IndexedDB)
  imageFiles?: File[];
  videoFiles?: File[];
  audioFile?: Blob | null;
}
