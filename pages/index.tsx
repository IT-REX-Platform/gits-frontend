export async function getServerSideProps() {
  return {
    redirect: {
      destination: "/student",
      permanent: false,
    },
  };
}

export default function Home() {
  return <div />;
}
