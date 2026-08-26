import React from "react";
import Head from "next/head";
import Layout from "../../components/Layout";
import AccountContent from "../../components/AccountContent";

export default function AccountSettingsPage() {
  return (
    <Layout activeTab="settings">
      {() => (
        <>
          <Head>
            <title>Account Settings - PiXL Pro Admin</title>
            <meta name="description" content="Manage company details, preferences, and account controls" />
          </Head>
          <AccountContent />
        </>
      )}
    </Layout>
  );
}
