import React from "react";
import Head from "next/head";
import Layout from "../../components/Layout";
import EstimatesSettingsContent from "../../components/EstimatesSettingsContent";

export default function EstimatesSettingsPage() {
  return (
    <Layout activeTab="estimates">
      {() => (
        <>
          <Head>
            <title>Estimates Settings - PiXL Pro Admin</title>
            <meta
              name="description"
              content="Configure estimate preferences, PDF attachments, and approval locks."
            />
          </Head>
          <EstimatesSettingsContent />
        </>
      )}
    </Layout>
  );
}
