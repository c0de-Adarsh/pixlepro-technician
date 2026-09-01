import React from "react";
import Head from "next/head";
import Layout from "../../components/Layout";
import EquipmentReportContent from "../../components/EquipmentReportContent";

export default function EquipmentReportPage() {
  return (
    <Layout activeTab="reports">
      {() => (
        <>
          <Head>
            <title>Equipment Report - PiXL Pro Admin</title>
            <meta name="description" content="Tracking equipment installations, serial numbers, warranties, and service histories" />
          </Head>
          <EquipmentReportContent />
        </>
      )}
    </Layout>
  );
}
