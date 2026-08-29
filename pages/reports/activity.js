import Head from "next/head";
import Layout from "../../components/Layout";
import ActivityReportContent from "../../components/ActivityReportContent";

export default function ActivityPage() {
  return (
    <Layout activeTab="reports">
      {() => (
        <>
          <Head>
            <title>Activity Report - PiXL Pro Admin</title>
            <meta name="description" content="View team member and client activity logs" />
          </Head>
          <ActivityReportContent />
        </>
      )}
    </Layout>
  );
}
