import React from "react";
import Head from "next/head";
import Layout from "../../components/Layout";
import SubStatusContent from "../../components/SubStatusContent";

export default function JobSubStatusPage() {
  return (
    <Layout activeTab="settings">
      {() => (
        <>
          <Head>
            <title>Sub Status - PiXL Pro Admin</title>
            <meta name="description" content="Manage Job Sub Statuses" />
          </Head>
          <SubStatusContent />
        </>
      )}
    </Layout>
  );
}
