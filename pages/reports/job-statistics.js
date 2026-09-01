import React from "react";
import Head from "next/head";
import Layout from "../../components/Layout";
import JobStatisticsContent from "../../components/JobStatisticsContent";

export default function JobStatisticsPage() {
  return (
    <Layout activeTab="reports">
      {() => (
        <>
          <Head>
            <title>Job Statistics - PiXL Pro Admin</title>
            <meta name="description" content="View job volume, sales, and performance statistics" />
          </Head>
          <JobStatisticsContent />
        </>
      )}
    </Layout>
  );
}
