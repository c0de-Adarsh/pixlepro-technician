import React from "react";
import Head from "next/head";
import Layout from "../../components/Layout";
import ServiceAreasContent from "../../components/ServiceAreasContent";

export default function ServiceAreasPage() {
  return (
    <Layout activeTab="settings">
      {() => (
        <>
          <Head>
            <title>Service Areas - PiXL Pro Admin</title>
            <meta name="description" content="Manage Service Areas and geographical coverage boundaries" />
          </Head>
          <ServiceAreasContent />
        </>
      )}
    </Layout>
  );
}
