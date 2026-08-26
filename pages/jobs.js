import React from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import JobsContent from "../components/JobsContent";

export default function JobsPage() {
  return (
    <Layout activeTab="jobs">
      {() => (
        <>
          <Head>
            <title>Jobs - PiXL Pro Admin</title>
            <meta name="description" content="Manage and Track Field Service Jobs" />
          </Head>
          <JobsContent />
        </>
      )}
    </Layout>
  );
}
