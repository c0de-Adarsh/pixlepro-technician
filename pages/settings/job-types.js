import React from "react";
import Head from "next/head";
import Layout from "../../components/Layout";
import JobTypesContent from "../../components/JobTypesContent";

export default function JobTypesPage() {
  return (
    <Layout activeTab="settings">
      {() => (
        <>
          <Head>
            <title>Job Types - PiXL Pro Admin</title>
            <meta name="description" content="Manage Job Types and assignment rules" />
          </Head>
          <JobTypesContent />
        </>
      )}
    </Layout>
  );
}
