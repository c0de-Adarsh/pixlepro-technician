import Head from "next/head";
import Layout from "../../components/Layout";
import TimesheetsContent from "../../components/TimesheetsContent";

export default function TimesheetsPage() {
  return (
    <Layout activeTab="reports">
      {() => (
        <>
          <Head>
            <title>Timesheets Report - PiXL Pro Admin</title>
            <meta name="description" content="Track team logged hours and shifts" />
          </Head>
          <TimesheetsContent />
        </>
      )}
    </Layout>
  );
}
