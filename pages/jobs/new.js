import React from "react";
import Head from "next/head";
import Layout from "../../components/Layout";
import NewJobContent from "../../components/NewJobContent";

export default function NewJobPage() {
  return (
    <Layout activeTab="jobs">
      {() => (
        <>
          <Head>
            <title>New Job - PiXL Pro Admin</title>
            <meta name="description" content="Create a new job for field technician dispatch" />
          </Head>
          <NewJobContent />
        </>
      )}
    </Layout>
  );
}
