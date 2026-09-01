import React from "react";
import Head from "next/head";
import Layout from "../../../components/Layout";
import WorkOrderDetailContent from "../../../components/WorkOrderDetailContent";

export default function WorkOrderPage() {
  return (
    <Layout activeTab="jobs">
      {() => (
        <>
          <Head>
            <title>Work Order - PiXL Pro Admin</title>
            <meta name="description" content="View and manage field work orders" />
          </Head>
          <WorkOrderDetailContent />
        </>
      )}
    </Layout>
  );
}
