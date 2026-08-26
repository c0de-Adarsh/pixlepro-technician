import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import EstimateDetailContent from "../../components/EstimateDetailContent";

export default function EstimateDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <Layout activeTab="estimates">
      {() => (
        <>
          <Head>
            <title>Estimate #{id || "1634"} - PiXL Pro Admin</title>
            <meta name="description" content="Estimate Details and Financial Breakdown" />
          </Head>
          <EstimateDetailContent estimateId={id || "1634"} />
        </>
      )}
    </Layout>
  );
}
