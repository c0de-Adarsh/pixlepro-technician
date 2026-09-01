import React from "react";
import Head from "next/head";
import Layout from "../../components/Layout";
import LeadStatusContent from "../../components/LeadStatusContent";

export default function LeadStatusPage() {
  return (
    <Layout activeTab="settings">
      {() => (
        <>
          <Head>
            <title>Lead Status - PiXL Pro Settings</title>
            <meta name="description" content="Customize your lead statuses" />
          </Head>
          <LeadStatusContent />
        </>
      )}
    </Layout>
  );
}
