'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import Breadcrumbs from '@/components/layout/common/Breadcrumbs';

export default function SwaggerDocs() {
  const [spec, setSpec] = useState(null);
  const { vendorId } = useParams();

  useEffect(() => {
    const fetchSwaggerSpec = async () => {
      const res = await fetch('/api/v1/docs');
      if (!res.ok) {
        console.error('Failed to fetch the Swagger spec');
        return;
      }
      const data = await res.json();
      setSpec(data);
    };

    fetchSwaggerSpec();

    document.body.style.backgroundColor = 'white';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  if (!spec) {
    return <div>Loading...</div>;
  }

  const breadCrumbLinks = [
    { text: 'Home', url: `/vendor/${vendorId}/dashboard` },
    { text: 'API Docs' }
  ];


  return (
    <>
      <Breadcrumbs breadCrumbLinks={breadCrumbLinks} />
      <div className="bg-white shadow-md rounded-lg p-6 mb-6 mt-10">
        <SwaggerUI spec={spec} />
      </div>
    </>
  );
}
