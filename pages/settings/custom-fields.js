import React from "react";
import Head from "next/head";
import Layout from "../../components/Layout";
import CustomFieldsContent from "../../components/CustomFieldsContent";

export default function CustomFieldsPage() {
  return (
    <Layout activeTab="settings">
      {() => (
        <>
          <Head>
            <title>Custom Fields Settings - PiXL Pro Admin</title>
            <meta
              name="description"
              content="Manage job and client custom fields for customized data collection."
            />
          </Head>
          <CustomFieldsContent />
        </>
      )}
    </Layout>
  );
}
