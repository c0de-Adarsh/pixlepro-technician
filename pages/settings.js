import React from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import SettingsContent from "../components/SettingsContent";

export default function SettingsPage() {
  return (
    <Layout activeTab="settings">
      {() => (
        <>
          <Head>
            <title>Account Settings - PiXL Pro Admin</title>
            <meta name="description" content="Manage Account & Profile Settings" />
          </Head>
          <SettingsContent />
        </>
      )}
    </Layout>
  );
}
