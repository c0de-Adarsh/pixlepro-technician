import React from "react";
import Head from "next/head";
import Layout from "../../components/Layout";
import AdGroupsContent from "../../components/AdGroupsContent";

export default function AdGroupsPage() {
  return (
    <Layout activeTab="settings">
      {() => (
        <>
          <Head>
            <title>Ad Groups Settings - PiXL Pro Admin</title>
            <meta
              name="description"
              content="Organize and track business ad groups and marketing performance."
            />
          </Head>
          <AdGroupsContent />
        </>
      )}
    </Layout>
  );
}
