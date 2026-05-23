import './globals.css';

export const metadata = {
  title: 'Aeterna AR - Multi-Tenant AR Restaurant Menu',
  description: 'Transform your restaurant menu into an immersive 3D Augmented Reality experience.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google HTML Model Viewer Script for AR Rendering */}
        <script
          type="module"
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"
          async
        ></script>
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased m-0 p-0">
        {children}
      </body>
    </html>
  );
    }
  
