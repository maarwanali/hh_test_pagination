import Head from "next/head";
import { Inter } from "next/font/google";
import Table from "react-bootstrap/Table";
import { Alert, Container, Pagination } from "react-bootstrap";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";

const inter = Inter({ subsets: ["latin"] });

type TUserItem = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  updatedAt: string;
};

type TGetServerSideProps = {
  statusCode: number;
  users: TUserItem[];
  totalItems: number;
};

export const getServerSideProps = (async (ctx: GetServerSidePropsContext): Promise<{ props: TGetServerSideProps }> => {
  const { page = 1, limit = 20 } = ctx.query;
  try {
    // Construct URL with query parameters
    const url = new URL("http://localhost:3000/users");
    url.searchParams.append("page", page.toString());
    url.searchParams.append("limit", limit.toString());

    const res = await fetch(url.href, { method: "GET" });
    if (!res.ok) {
      return { props: { statusCode: res.status, users: [], totalItems: 0 } };
    }

    // Fetch the total count of users
    const countResponse = await fetch(`${url.origin}/users/count`, { method: "GET" });
    if (!countResponse.ok) {
      throw new Error("Failed to fetch the count");
    }

    const countData = await countResponse.json();
    console.log(countData);
    const totalItems = countData.counter; // Replace `count` with the actual property name from your API response

    return {
      props: { statusCode: 200, users: await res.json(), totalItems },
    };
  } catch (e) {
    console.error("Failed to fetch users or count:", e);
    return { props: { statusCode: 500, users: [], totalItems: 0 } };
  }
}) satisfies GetServerSideProps<TGetServerSideProps>;

export default function Home({ statusCode, users, totalItems }: TGetServerSideProps) {
  const router = useRouter();

  if (statusCode !== 200) {
    return <Alert variant={"danger"}>Ошибка {statusCode} при загрузке данных</Alert>;
  }

  const currentPage = parseInt(router.query.page as string) || 1;
  const pageSize = parseInt(router.query.limit as string) || 20;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Calculate the page range to display
  const startPage = Math.max(1, currentPage - 4); //3
  const endPage = Math.min(totalPages, currentPage + 6); //13
  const pagesToShow = Array.from({ length: Math.min(10, endPage - startPage + 1) }, (_, idx) => startPage + idx);

  return (
    <>
      <Head>
        <title>Тестовое задание</title>
        <meta name="description" content="Тестовое задание" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={inter.className}>
        <Container>
          <h1 className={"mb-5"}>Пользователи</h1>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Имя</th>
                <th>Фамилия</th>
                <th>Телефон</th>
                <th>Email</th>
                <th>Дата обновления</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.firstname}</td>
                  <td>{user.lastname}</td>
                  <td>{user.phone}</td>
                  <td>{user.email}</td>
                  <td>{user.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/*TODO add pagination*/}
          <Pagination>
            <Pagination.First href={`/?page=1&limit=${pageSize}`} disabled={currentPage === 1} />
            <Pagination.Prev
              href={`/?page=${Math.max(1, currentPage - 1)}&limit=${pageSize}`}
              disabled={currentPage === 1}
            />
            {currentPage > 5 && (
              <>
                <Pagination.Item href={`/?page=1&limit=${pageSize}`}>1</Pagination.Item>
                {currentPage > 6 && <Pagination.Ellipsis disabled />}
              </>
            )}
            {pagesToShow.map((number) => (
              <Pagination.Item key={number} active={number === currentPage} href={`/?page=${number}&limit=${pageSize}`}>
                {number}
              </Pagination.Item>
            ))}
            {currentPage < totalPages - 4 && (
              <>
                {currentPage < totalPages - 5 && <Pagination.Ellipsis disabled />}
                <Pagination.Item href={`/?page=${totalPages}&limit=${pageSize}`}>{totalPages}</Pagination.Item>
              </>
            )}
            <Pagination.Next
              href={`/?page=${Math.min(totalPages, currentPage + 1)}&limit=${pageSize}`}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last href={`/?page=${totalPages}&limit=${pageSize}`} disabled={currentPage === totalPages} />
          </Pagination>
        </Container>
      </main>
    </>
  );
}
