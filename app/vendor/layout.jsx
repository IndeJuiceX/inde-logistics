import FloatingScrollTop from '@/components/layout/common/FloatingScrollTop';
import VendorLayout from '@/components/layout/vendor/Vendor';

export default function AdminLayoutWrapper({ children }) {
  return (
    <VendorLayout>
      {children}
      <FloatingScrollTop />
    </VendorLayout>
  );
}
