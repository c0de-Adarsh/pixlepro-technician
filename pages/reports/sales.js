import React from "react";
import Head from "next/head";
import Layout from "../../components/Layout";
import SalesReportContent from "../../components/SalesReportContent";

export default function SalesReportPage() {
  return (
    <Layout activeTab="reports">
      {() => (
        <>
          <Head>
            <title>Sales Report - PiXL Pro Admin</title>
            <meta name="description" content="View comprehensive sales, profit, margins, and territory performance" />
          </Head>
          <SalesReportContent />
        </>
      )}
    </Layout>
  );
}
