export default function MapEmbed({lat, lng}: {lat: number, lng: number}) {
  const mapUrl = `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
  return (
    <iframe
      src={mapUrl}
      width="100%"
      height="450"
      style={{ border: 0 }}
      allowFullScreen
      loading="lazy"
    ></iframe>
  );
};