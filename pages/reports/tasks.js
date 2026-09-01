import React from "react";
import Layout from "../../components/Layout";
import TasksReportContent from "../../components/TasksReportContent";
import Head from "next/head";

export default function TasksReportPage() {
  return (
    <Layout>
      <Head>
        <title>Tasks Report - PixelPro Admin</title>
      </Head>
      <TasksReportContent />
    </Layout>
  );
}
