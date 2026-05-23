'use client';

export default function QRCodeGen({ slug }) {
  // We use a high-quality open-source QR API to generate QR codes on the fly without heavy packages
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    window.location.origin + '/menu/' + slug
  )}`;

  const handleDownload = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug}-ar-menu-qr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading QR Code:', error);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700/60 rounded-xl p-5 flex flex-col items-center text-center">
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Scan to View AR Menu</h4>
      
      {/* QR Code Image Container */}
      <div className="bg-white p-3 rounded-xl shadow-inner mb-4">
        <img 
          src={qrCodeUrl} 
          alt="Restaurant AR Menu QR Code" 
          className="w-40 h-40 object-contain"
          loading="lazy"
        />
      </div>

      <button
        onClick={handleDownload}
        className="w-full bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/20 text-xs font-bold py-2 rounded-lg transition"
      >
        Download QR Code (PNG)
      </button>
    </div>
  );
    }
        
