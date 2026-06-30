import Footer from './Footer';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-bg-page font-[Georgia,serif] flex flex-col">
      {children}
      <Footer />
    </div>
  );
}
