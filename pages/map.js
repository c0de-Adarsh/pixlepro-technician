import React from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import MapContent from "../components/MapContent";

export default function MapPage() {
  return (
    <Layout activeTab="map">
      {() => (
        <>
          <Head>
            <title>Map & Live Dispatch - PiXL Pro Admin</title>
            <meta name="description" content="Live Dispatch and Technician Field Map" />
          </Head>
          <MapContent />
        </>
      )}
    </Layout>
  );
}
