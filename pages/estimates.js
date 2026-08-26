import React from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import EstimatesContent from "../components/EstimatesContent";

export default function EstimatesPage() {
  return (
    <Layout activeTab="estimates">
      {() => (
        <>
          <Head>
            <title>Estimates Management - PiXL Pro Admin</title>
            <meta name="description" content="Review and manage all financial estimates" />
          </Head>
          <EstimatesContent />
        </>
      )}
    </Layout>
  );
}
