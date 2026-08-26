import React from "react";
import Head from "next/head";
import Layout from "../../components/Layout";
import JobDetailContent from "../../components/JobDetailContent";

export default function JobDetailPage() {
  return (
    <Layout activeTab="jobs">
      {() => (
        <>
          <Head>
            <title>Job Details - PiXL Pro Admin</title>
            <meta name="description" content="View and edit field job details" />
          </Head>
          <JobDetailContent />
        </>
      )}
    </Layout>
  );
}
