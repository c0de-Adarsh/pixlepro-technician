import React from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import ScheduleContent from "../components/ScheduleContent";

export default function SchedulePage() {
  return (
    <Layout activeTab="schedule">
      {() => (
        <>
          <Head>
            <title>Schedule & Calendar - PiXL Pro Admin</title>
            <meta name="description" content="Field Service Workiz Calendar Schedule" />
          </Head>
          <ScheduleContent />
        </>
      )}
    </Layout>
  );
}
