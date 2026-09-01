import React from "react";
import Head from "next/head";
import Layout from "../../components/Layout";
import LeadDetailContent from "../../components/LeadDetailContent";

export default function LeadDetailPage() {
  return (
    <Layout activeTab="leads">
      {() => (
        <>
          <Head>
            <title>Lead Details - PiXL Pro Admin</title>
            <meta name="description" content="View and manage lead details" />
          </Head>
          <LeadDetailContent />
        </>
      )}
    </Layout>
  );
}
