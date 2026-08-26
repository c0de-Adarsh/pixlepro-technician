import React from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import LeadsContent from "../components/LeadsContent";

export default function LeadsPage() {
  return (
    <Layout activeTab="leads">
      {() => (
        <>
          <Head>
            <title>Leads - PiXL Pro Admin</title>
            <meta name="description" content="Manage and Track Field Service Leads" />
          </Head>
          <LeadsContent />
        </>
      )}
    </Layout>
  );
}
