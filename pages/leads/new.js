import React from "react";
import Head from "next/head";
import Layout from "../../components/Layout";
import NewJobContent from "../../components/NewJobContent";

export default function NewLeadPage() {
  return (
    <Layout activeTab="leads">
      {() => (
        <>
          <Head>
            <title>New Lead - PiXL Pro Admin</title>
            <meta name="description" content="Create a new sales lead" />
          </Head>
          <NewJobContent />
        </>
      )}
    </Layout>
  );
}
