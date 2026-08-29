import React from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import ReportsContent from "../components/ReportsContent";

export default function ReportsPage() {
  return (
    <Layout activeTab="reports">
      {() => (
        <>
          <Head>
            <title>Reports - PiXL Pro Admin</title>
            <meta name="description" content="PiXL Pro Reports & Analytics" />
          </Head>
          <ReportsContent />
        </>
      )}
    </Layout>
  );
}
