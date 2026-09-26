import Layout from "./Layout";
import PageHeader from "./PageHeader";

export default function Shell({ title, subtitle, children }) {
  return (
    <Layout>
      <PageHeader title={title} subtitle={subtitle} />
      {children}
    </Layout>
  );
}
